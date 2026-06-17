<?php

namespace App\Controller;

use App\Entity\Groupe;
use App\Entity\Aidant;
use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Security\Voter\OwnershipVoter;

#[Route('/api/groupes', name: 'api_groupes_')]
class GroupeController extends AbstractController
{
    /**
     * Endpoint: POST /api/groupes
     * Test associé: Tests/Groupe/CreerFamille.http
     * - Méthode: POST
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Body JSON: { "nom": "Famille Martin" }
     * - Réponses:
     *   - 201 : groupe créé -> retourne id, nom
     *   - 400 : nom manquant
     *
     * Comportement: le créateur est automatiquement ajouté comme membre du groupe.
     */
    #[Route('', name: 'creation', methods: ['POST'])]
    #[IsGranted('ROLE_AIDANT')]
    public function creer(Request $request, EntityManagerInterface $em, #[CurrentUser] ?Utilisateur $user): JsonResponse
    {
        // 1. On récupère les données envoyées (le nom du groupe)
        $data = json_decode($request->getContent(), true);
        
        // 2. Validation simple des données
        if (empty($data['nom'])) {
            return $this->json(['error' => 'Le nom du groupe est obligatoire'], 400);
        }

        // 3. Création de l'entité Groupe
        $groupe = new Groupe();
        $groupe->setNom($data['nom']);
        
        // 4. Important : Le créateur est automatiquement ajouté comme premier membre
        $groupe->addMembre($user); 

        // 5. Sauvegarde en base de données
        $em->persist($groupe);
        $em->flush();

        return $this->json([
            'message' => 'Groupe créé avec succès',
            'id' => $groupe->getId(),
            'nom' => $groupe->getNom()
        ], 201);
    }

    /**
     * Endpoint: GET /api/groupes
     * Test associé: (usage console / inspection utilisateur)
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Réponse: liste des groupes de l'aidant (id, nom, nb_membres)
     */
    #[Route('', name: 'liste', methods: ['GET'])]
    #[IsGranted('ROLE_AIDANT')]
    public function mes_groupes(#[CurrentUser] ?Utilisateur $user): JsonResponse
    {
        // 1. Vérification de typage (pour accéder à la méthode getGroupes de l'enfant Aidant)
        if (!$user instanceof Aidant) {
            return $this->json([]); 
        }
        // 2. Récupération automatique des groupes via la relation Doctrine
        $groupes = $user->getGroupes(); 
        $data = [];
        // 3. Construction du tableau de réponse
        foreach ($groupes as $groupe) {
            $data[] = [
                'id' => $groupe->getId(),
                'nom' => $groupe->getNom(),
                'nb_membres' => $groupe->getMembres()->count(),
            ];
        }

        return $this->json($data);
    }

    /**
     * Endpoint: GET /api/groupes/{id}
     * Test associé: Tests/Groupe/VoirMembre.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Paramètre: id (entier)
     * - Réponses:
     *   - 200 : détails du groupe (id, nom, membres)
     *   - 403 : accès interdit si l'utilisateur n'est pas membre
     *
     * Comportement: Anti-IDOR — vérifie que l'utilisateur fait partie du groupe demandé.
     */
    #[Route('/{id}', name: 'detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_AIDANT')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'groupe', message: 'Accès interdit à ce groupe')]
    public function detail(Groupe $groupe): JsonResponse
    {
        // 1. On récupère et formate la liste des membres pour l'affichage
        $membres = [];
        foreach ($groupe->getMembres() as $membre) {
            $membres[] = [
                'id' => $membre->getId(),
                'nom' => $membre->getNom(),
                'prenom' => $membre->getPrenom(),
                'email' => $membre->getEmail(),
            ];
        }
        // 2. On renvoie les infos du groupe et ses membres
        return $this->json([
            'id' => $groupe->getId(),
            'nom' => $groupe->getNom(),
            'membres' => $membres
        ]);
    }

    /**
     * Endpoint: POST /api/groupes/ajouter-membre/{id}
     * Test associé: Tests/Groupe/AjouterMembre.http
     * - Méthode: POST
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Body JSON: { "email": "claude@test.com" }
     * - Réponses:
     *   - 200 : ajout réussi (message)
     *   - 400 : email manquant
     *   - 403 : l'invitant n'est pas membre du groupe
     *   - 404 : utilisateur introuvable
     *   - 409 : utilisateur déjà membre
     *
     * Comportement: seul un membre du groupe peut inviter; recherche par email via UtilisateurRepository.
     */
    #[Route('/ajouter-membre/{id}', name: 'ajout_membre', methods: ['POST'])]
    #[IsGranted('ROLE_AIDANT')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'groupe', message: 'Vous ne faites pas partie de ce groupe')]
    public function ajouter_membre(Groupe $groupe, Request $request, EntityManagerInterface $em, UtilisateurRepository $userRepo): JsonResponse
    {
        // 1. Validation de l'email reçu
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        if (!$email) {
            return $this->json(['error' => 'L\'email du membre à inviter est requis'], 400);
        }
        // 2. Recherche de l'utilisateur à ajouter
        $nouveauMembre = $userRepo->findOneBy(['email' => $email]);
        if (!$nouveauMembre) {
            return $this->json(['error' => 'Aucun utilisateur trouvé avec cet email'], 404);
        }
        // 3. Vérification doublon : Est-il déjà dans le groupe ?
        if ($groupe->getMembres()->contains($nouveauMembre)) {
            return $this->json(['error' => 'Cet utilisateur est déjà dans le groupe'], 409);
        }
        // 4. Ajout de la relation et sauvegarde
        $groupe->addMembre($nouveauMembre);
        $em->flush();
        // 5. Affichage du Prénom (Aidant) ou Nom (Autre)
        $nomAffichage = $nouveauMembre->getNom();
        if ($nouveauMembre instanceof \App\Entity\Aidant) {
            $nomAffichage = $nouveauMembre->getPrenom();
        }

        return $this->json([
            'message' => $nomAffichage . ' a été ajouté au groupe avec succès.'
        ]);
    }

    /**
     * Endpoint: GET /api/groupes/quitter/{id}
     * Test associé: Tests/Groupe/QuitterGroupe.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Réponses:
     *   - 200 : message de confirmation de départ
     *   - 400 : l'utilisateur ne fait pas partie du groupe
     *
     * Comportement: si le groupe devient vide après le départ, il est supprimé.
     */
    #[Route('/quitter/{id}', name: 'quitter', methods: ['GET'])]
    #[IsGranted('ROLE_AIDANT')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'groupe', message: 'Vous ne faites pas partie de ce groupe')]
    public function quitter_groupe(Groupe $groupe, EntityManagerInterface $em, #[CurrentUser] ?Utilisateur $user): JsonResponse
    {
        // 1. Suppression de la relation (l'utilisateur quitte le groupe)
        $groupe->removeMembre($user);

        // 2. Nettoyage : Si le groupe est vide après le départ, on le supprime définitivement
        if ($groupe->getMembres()->isEmpty()) {
            $em->remove($groupe);
        }

        // 3. Sauvegarde des changements
        $em->flush();

        return $this->json(['message' => 'Vous avez quitté le groupe.']);
    }
}