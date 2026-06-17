<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\ExpressionLanguage\Expression;
use App\Security\Voter\OwnershipVoter;
use App\Entity\AchatAvantage;
use App\Repository\AvantageRepository;
use App\Entity\Aidant;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use App\Entity\Avantage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/avantages', name: 'api_avantages_')]
class AvantagesController extends AbstractController
{
    /**
     * Endpoint: GET /api/avantages
     * Test associé: Tests/Avantages/ListerAvantages.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT ou ROLE_PRO)
     * - Retour: liste d'avantages (id, nom, description, points, approuve)
     */
    #[Route('', name: 'api_avantages.liste', methods: ['GET'])]
    // On vérifie le rôle de l'utilisateur = AIDANT ou PRO
    #[IsGranted(new Expression('is_granted("ROLE_AIDANT") or is_granted("ROLE_PRO")'))]
    public function liste_avantages(AvantageRepository $avantageRepository) : JsonResponse
    {
        // 1. On récupère la liste complète des avantages
        $avantages = $avantageRepository->findAll();
        
        $data = [];

        // 2. On formate les données pour le retour JSON
        foreach ($avantages as $avantage) {
            $data[] = [
                'id' => $avantage->getId(),
                'nom' => $avantage->getNom(),
                'description' => $avantage->getDescription(),
                'points' => $avantage->getPrix(),
                'approuve' => $avantage->isApprouve(),
            ];
        }

        return $this->json($data);
    }

    /**
     * Endpoint: GET /api/avantages/{id}
     * Test associé: Tests/Avantages/DetailsUnAvantage.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Paramètre: id (entier)
     * - Comportement: accès refusé (403) si non approuvé et utilisateur non propriétaire
     * - Retour: détails de l'avantage
     */
    #[Route('/{id}', name: 'api_avantages.detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted(new Expression('is_granted("ROLE_AIDANT") or is_granted("ROLE_PRO")'))]
    public function detail_avantage(Avantage $avantage) : JsonResponse
    {
        // 1. Si l'avantage n'est pas approuvé et que l'utilisateur n'est pas le propriétaire, on refuse l'accès
        if (!$avantage->isApprouve() && !$this->isGranted('ROLE_PRO')) {
            return $this->json(['error' => 'Accès refusé. Cet avantage n\'est pas encore approuvé.'], 403);
        }
        // 2. On prépare les données détaillées de l'avantage
        $data = [
            'id' => $avantage->getId(),
            'nom' => $avantage->getNom(),
            'description' => $avantage->getDescription(),
            'prix' => $avantage->getPrix(),
            'lienQR' => $avantage->getLienQR(),
            'approuve' => $avantage->isApprouve(),
            'proprietaire' => [
                'id' => $avantage->getProprietaire()?->getId(),
                'nom' => $avantage->getProprietaire()?->getNom(),
            ]
        ];

        return $this->json($data);
    }

    /**
     * Endpoint: POST /api/avantages
     * Test associé: Tests/Avantages/CreerAvantage.http
     * - Méthode: POST
     * - Header: Content-Type: application/json + Authorization: Bearer <token> (ROLE_PRO requis)
     * - Body JSON: { nom, description, prix, lienQR }
     * - Comportement: crée un avantage non approuvé et retourne id (201)
     */
    #[Route('', name: 'api_avantages.creation', methods: ['POST'])]
    #[IsGranted('ROLE_PRO')]
    public function creation_avantage(Request $request, EntityManagerInterface $em, #[CurrentUser] ?Utilisateur $user) : JsonResponse
    {
        // 1. On vérifie que l'utilisateur est un Professionnel
        if (!$user instanceof Professionnel) {
            return $this->json(['error' => 'Seul un compte Professionnel peut créer un avantage.'], 403);
        }

        // 2. On récupère les données de la requête
        $data = json_decode($request->getContent(), true);

        // 3. On crée un nouvel avantage
        $avantage = new Avantage();
        $avantage->setNom($data['nom'] ?? '');
        $avantage->setDescription($data['description'] ?? '');
        $avantage->setLienQR($data['lienQR'] ?? '');
        $avantage->setPrix(0);
        $avantage->setApprouve(false);
        $avantage->setProprietaire($user);
        $em->persist($avantage);
        $em->flush();
        
        return $this->json([
            'message' => 'Avantage créé avec succès. Il est en attente de validation.',
            'id' => $avantage->getId()
        ], 201);
    }

    /**
     * Endpoint: PUT /api/avantages/{id}
     * Test associé: Tests/Avantages/ModifierAvantage.http
     * - Méthode: PUT
     * - Header: Content-Type: application/json + Authorization: Bearer <token> (ROLE_PRO requis)
     * - Body JSON: champs modifiables (nom, description, prix, lienQR)
     * - Comportement: seul le propriétaire peut modifier; repasse à non approuvé
     */
    #[Route('/{id}', name: 'api_avantages.modification', methods: ['PUT'])]
    #[IsGranted('ROLE_PRO')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'avantage', message: 'Vous ne pouvez pas modifier l\'avantage d\'un autre professionnel.')]
    public function modification_avantage(Avantage $avantage, Request $request, EntityManagerInterface $em, #[CurrentUser] ?Utilisateur $user) : JsonResponse
    {
        // 1. On récupère et met à jour les données
        $data = json_decode($request->getContent(), true);
        $avantage->setNom($data['nom'] ?? $avantage->getNom());
        $avantage->setDescription($data['description'] ?? $avantage->getDescription());
        $avantage->setLienQR($data['lienQR'] ?? $avantage->getLienQR());
        
        // 2. Logique métier : Repasser en non approuvé après modification
        $avantage->setApprouve(false); 

        $em->flush();

        return $this->json([
            'message' => 'Avantage modifié avec succès. Il est en attente de validation.',
            'id' => $avantage->getId()
        ]);
    }

    /**
     * Endpoint: DELETE /api/avantages/{id}
     * Test associé: Tests/Avantages/SupprimerAvantage.http
     * - Méthode: DELETE
     * - Header: Authorization: Bearer <token> (ROLE_PRO requis)
     * - Comportement: seul le propriétaire peut supprimer l'avantage
     */
    #[Route('/{id}', name: 'api_avantages.suppression', methods: ['DELETE'])]
    #[IsGranted('ROLE_PRO')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'avantage', message: 'Vous ne pouvez pas supprimer l\'avantage d\'un autre professionnel.')]
    public function suppression_avantage(Avantage $avantage, EntityManagerInterface $em) : JsonResponse
    {
        // On supprime l'avantage de la base de données
        $em->remove($avantage);
        $em->flush();

        return $this->json(['message' => 'Avantage supprimé avec succès']);
    }

    /**
     * Endpoint: GET /api/avantages/reclamer/{id}
     * Test associé: Tests/Avantages/ReclamerAvantage.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Comportement: vérifie approbation et points, débite l'aidant, associe l'avantage
     */
    #[Route('/reclamer/{id}', name: 'api_avantages.reclamer', methods: ['GET'])]
    #[IsGranted('ROLE_AIDANT')]
    public function reclamer_avantages(#[CurrentUser] ?Utilisateur $user, EntityManagerInterface $em, Avantage $avantage) : JsonResponse
    {
        // 1. On vérifie que l'utilisateur est un Aidant
        if (!$user instanceof Aidant) {
            return $this->json(['error' => 'Seul un compte Aidant peut réclamer un avantage.'], 403);
        }


        // 2. On vérifie que l'avantage est approuvé
        if (!$avantage->isApprouve()) {
            return $this->json(['error' => 'Cet avantage n\'est pas approuvé et ne peut pas être réclamé.'], 403);
        }

        // 3. On vérifie que l'aidant a assez de points
        if ($user->getPts() < $avantage->getPrix()) {
            return $this->json(['error' => 'Vous n\'avez pas assez de points pour réclamer cet avantage.'], 403);
        }

        // 4. On effectue la transaction
        $user->setPts($user->getPts() - $avantage->getPrix());

        $nouvelAchat = new AchatAvantage();
        $nouvelAchat->setAidant($user);
        $nouvelAchat->setAvantage($avantage);

        $em->persist($nouvelAchat);
        $em->flush();

        return $this->json(['message' => 'Avantage réclamé avec succès !']);
    }

    /**
     * Endpoint: GET /api/avantages/mes-avantages
     * Test associé: Tests/Avantages/MesAvantages.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Retour: avantages détenus par l'aidant (id, nom, description, lienQR, prix)
     */
    #[Route('/mes-avantages', name: 'api_avantages.mes_avantages', methods: ['GET'])]
    #[IsGranted('ROLE_AIDANT')]
    public function mes_avantages(#[CurrentUser] ?Utilisateur $user) : JsonResponse
    {
        // 1. On vérifie le type de l'utilisateur
        if (!$user instanceof Aidant) {
            return $this->json(['error' => 'Accès réservé aux Aidants.'], 403);
        }

        // 2. On récupère les avantages liés à cet utilisateur
        $avantages = $user->getAvantagesObtenus();
        $data = [];

        // 3. On formate les données
        foreach ($avantages as $avantage) {
            $data[] = [
                'id' => $avantage->getId(),
                'nom' => $avantage->getNom(),
                'description' => $avantage->getDescription(),
                'lienQR' => $avantage->getLienQR(),
                'prix' => $avantage->getPrix(),
            ];
        }
        return $this->json($data);
    }

    /**
     * Endpoint: GET /api/avantages/approuves
     * Test associé: Tests/Avantages/ListerAvantagesAppouves.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Retour: liste des avantages approuvés uniquement
     */
    #[Route('/approuves', name: 'api_avantages.liste_approuves', methods: ['GET'])]
    #[IsGranted('ROLE_AIDANT')]
    public function liste_avantages_approuves(AvantageRepository $avantageRepository) : JsonResponse
    {
        // 1. On récupère uniquement les avantages approuvés
        $avantages = $avantageRepository->findBy(['approuve' => true]);
        $data = [];
        
        // 2. On formate les données
        foreach ($avantages as $avantage) {
            $data[] = [
                'id' => $avantage->getId(),
                'nom' => $avantage->getNom(),
                'description' => $avantage->getDescription(),
                'points' => $avantage->getPrix(),
                'approuve' => $avantage->isApprouve(),
            ];
        }

        return $this->json($data);
    }

    /**
     * Endpoint: POST /api/avantages/approuver/{id}
     * Test associé: Tests/Avantages/ValiderAvantage.http
     * - Méthode: POST
     * - Header: Authorization: Bearer <token> (ROLE_ADMIN requis)
     * - Comportement: passe l'avantage en approuvé
     */
    #[Route('/approuver/{id}', name: 'api_avantages.approuver', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function approuver_avantage(Avantage $avantage, EntityManagerInterface $em) : JsonResponse
    {
        // 1. On passe le statut de l'avantage à "Approuvé"
        $avantage->setApprouve(true);
        $em->flush();
        
        return $this->json(['message' => 'Avantage approuvé avec succès']);
    }

    /**
     * Endpoint: POST /api/avantages/refuser/{id}
     * Test associé: Tests/Avantages/DevaliderAvantage.http
     * - Méthode: POST
     * - Header: Authorization: Bearer <token> (ROLE_ADMIN requis)
     * - Comportement: passe l'avantage en non approuvé
     */
    #[Route('/refuser/{id}', name: 'api_avantages.refuser', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function refuser_avantage(Avantage $avantage, EntityManagerInterface $em) : JsonResponse
    {
        // 1. On passe le statut de l'avantage à "Refusé" (false)
        $avantage->setApprouve(false);
        $em->flush();

        return $this->json(['message' => 'Avantage refusé avec succès']);
    }

    /**
     * Endpoint: POST /api/avantages/revoquer/{id}
     * Test associé: Tests/Avantages/RevoquerAvantage.http
     * - Méthode: POST
     * - Header: Content-Type: application/json + Authorization: Bearer <token> (ROLE_PRO requis)
     * - Body JSON: { "aidantId": <id> }
     * - Comportement: propriétaire retire un avantage d'un aidant (vérifie possession)
     */
    #[Route('/revoquer/{id}', name: 'api_avantages.revoquer', methods: ['POST'])]
    #[IsGranted('ROLE_PRO')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'avantage', message: 'Vous ne pouvez pas gérer les avantages d\'un autre professionnel.')]
    public function revoquer_avantage(Avantage $avantage, Request $request, EntityManagerInterface $em) : JsonResponse
    {
        // 1. On récupère l'ID de l'aidant depuis la requête
        $data = json_decode($request->getContent(), true);
        $aidantId = $data['aidantId'] ?? null;

        if (!$aidantId) {
            return $this->json(['error' => 'ID de l\'aidant manquant.'], 400);
        }

        // 2. On recherche l'achat correspondant
        $achat = $em->getRepository(AchatAvantage::class)->findOneBy([
            'aidant' => $aidantId,
            'avantage' => $avantage
        ], ['dateAchat' => 'ASC']); // On prend le premier acheté

        if (!$achat) {
            return $this->json(['error' => 'Cet utilisateur ne possède pas (ou plus) cet avantage.'], 404);
        }

        // 4. On retire l'avantage de l'aidant (consommation)
        $em->remove($achat);
        $em->flush();

        return $this->json(['message' => 'Avantage révoqué avec succès pour l\'aidant.']);

    }

    /**
     * Endpoint: GET /api/avantages/pro/mes-avantages
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_PROFESSIONNEL requis)
     * - Retour: Liste des avantages CRÉÉS par ce professionnel
     */
    #[Route('/pro/mes-avantages', name: 'api_avantages.mes_avantages_pro', methods: ['GET'])]
    #[IsGranted('ROLE_PRO')]
    public function mes_avantages_pro(#[CurrentUser] ?Utilisateur $user, AvantageRepository $avantageRepo) : JsonResponse
    {
        // 1. Vérification de sécurité
        if (!$user instanceof Professionnel) {
            return $this->json(['error' => 'Accès réservé aux Professionnels.'], 403);
        }

        // 2. Récupération des avantages dont le pro est le propriétaire
        $avantages = $avantageRepo->findBy(['proprietaire' => $user]);

        $data = [];

        // 3. Formatage
        foreach ($avantages as $avantage) {
            $data[] = [
                'id' => $avantage->getId(),
                'nom' => $avantage->getNom(),
                'description' => $avantage->getDescription(),
                'lienQR' => $avantage->getLienQR(),
                'prix' => $avantage->getPrix(),
                
                // Infos supplémentaires utiles pour le Pro :
                'estApprouve' => $avantage->isApprouve(),
                'nbVentes' => $avantage->getAchats()->count(),
            ];
        }

        return $this->json($data);
    }

}