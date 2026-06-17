<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Adresse;
use App\Entity\Aidant;
use App\Entity\Professionnel;
use App\Entity\AchatAvantage;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\Utilisateur;
use App\Repository\AvantageRepository;
use App\Repository\GroupeRepository;
use App\Repository\MessageRepository;
use App\Repository\ServiceRepository;
use App\Repository\TacheRepository;
use Symfony\Component\Security\Http\Attribute\IsGranted;

use function PHPSTORM_META\type;


class AcountController extends AbstractController
{
    /**
     * Endpoint: POST /api/creer_compte
     * Utilisation (exemples dans Tests/Accounts/createAidantAccount.http et createProAccount.http) :
     * - Header: Content-Type: application/json
     * - Header: Authorization: Bearer <token>  (les tests incluent un token)
     *
     * Corps JSON pour un aidant :
     * {
     *   "type": "aidant",
     *   "email": "...",
     *   "nom": "...",
     *   "prenom": "...",
     *   "password": "...",        // optionnel mais utilisé dans les tests
     *   "telephone": "...",
     *   "adresse": "..."          // peut être vide
     * }
     *
     * Corps JSON pour un professionnel :
     * {
     *   "type": "professionnel",
     *   "email": "...",
     *   "password": "...",
     *   "nom": "...",
     *   "nomContact": "...",
     *   "telephone": "...",
     *   "adresses": ["addr1", "addr2"] // optionnel
     * }
     *
     * Réponses :
     * - 200 : compte aidant créé (dans la logique actuelle)
     * - 201 : compte professionnel créé
     * - 400 : données incomplètes / type inconnu
     */
    #[Route('/api/creer_compte', name: 'api_compte.creer', methods: ['POST'])]
    public function creer_compte(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): JsonResponse
    {
        // 1. On récupère et vérifie les données de la requête (type obligatoire)
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['type'])) {
            return $this->json(['error' => 'Données incomplètes'], 400);
        }

        $type = $data['type'];

        // 2. Cas de la création d'un compte Aidant
        if($type === 'aidant'){
            $utilisateur = new Aidant($data['email'], $data['nom'], $data['prenom'], $data['telephone'], $data['adresse']);
            
            // Hashage du mot de passe
            if (isset($data['password'])) {
                $hashedPassword = $hasher->hashPassword($utilisateur, $data['password']);
                $utilisateur->setPassword($hashedPassword);
            }
            
            $utilisateur->setPts(0);
            $em->persist($utilisateur);
            $em->flush();

            return new JsonResponse(['status' => 'Compte créé avec succès']);

        // 3. Cas de la création d'un compte Professionnel
        } else if($type === 'professionnel'){
            $utilisateur = new Professionnel(
                $data['email'], 
                $data['nom'], 
                $data['nomContact'], 
                $data['telephone'] ?? null
            );

            // Hashage du mot de passe
            if (isset($data['password'])) {
                $hashedPassword = $hasher->hashPassword($utilisateur, $data['password']);
                $utilisateur->setPassword($hashedPassword);
            }

            // Gestion des adresses multiples pour le pro
            if (isset($data['adresses']) && is_array($data['adresses'])) {
                foreach ($data['adresses'] as $texteAdresse) {
                    $adresse = new Adresse($texteAdresse, $utilisateur);
                    $em->persist($adresse);
                    $utilisateur->addAdress($adresse);
                }
            }

            $em->persist($utilisateur);
            $em->flush();

            return new JsonResponse(['status' => 'Compte pro créé avec succès'], 201);
        }

        // 4. Gestion d'erreur si le type n'est ni aidant ni pro
        return new JsonResponse(['error' => 'Type de compte inconnu'], 400);
    }

    /**
     * Endpoint: POST /api/supprimer_compte
     * Utilisation (exemple dans Tests/Accounts/DeleteAccount.http) :
     * - Header: Authorization: Bearer <token> (obligatoire : CurrentUser injecté)
     * - Body JSON: { "password": "votreMotDePasse" }
     *
     * Comportement :
     * - 401 si utilisateur non identifié (token manquant/invalide)
     * - 400 si données incomplètes
     * - 403 si mot de passe incorrect
     * - 200 si suppression réussie
     */
    #[Route('/api/supprimer_compte', name: 'api_test', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function supprimer_compte(#[CurrentUser] Utilisateur $user, Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher, MessageRepository $messageRepo, ServiceRepository $serviceRepo, TacheRepository $tacheRepo, AvantageRepository $avantageRepo): JsonResponse
    {
        // 1. On vérifie que l'utilisateur est bien authentifié
        if (null === $user) {
            return $this->json(['error' => 'Utilisateur non identifié (Token manquant ou invalide)'], 401);
        }

        // 2. On récupère les données et on vérifie la présence du mot de passe
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['password'])) {
            return $this->json(['error' => 'Données incomplètes'], 400);
        }

        // 3. On vérifie que le mot de passe fourni correspond à l'utilisateur actuel (Sécurité ultime)
        if (!$hasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Mot de passe incorrect'], 403);
        }

        // 4.Suppression des entités liées à l'utilisateur avant de supprimer l'utilisateur lui-même
        // Suppression des messages
        $messagesEnvoyes = $messageRepo->findBy(['auteur' => $user]);
        $messagesRecus = $messageRepo->findBy(['destinataire' => $user]);
        
        foreach ($messagesEnvoyes as $m) $em->remove($m);
        foreach ($messagesRecus as $m) $em->remove($m);

        // On verifie si l'utilisateur est un Aidant
        if ($user instanceof Aidant) {
            // A. Suppression des groupes
            $groupes = $user->getGroupes()->toArray(); 
            foreach ($groupes as $groupe) {
                $user->removeGroupe($groupe);
                
                // Si le groupe devient vide, on le supprime
                if ($groupe->getMembres()->isEmpty()) {
                    $msgsGroupe = $messageRepo->findBy(['groupe' => $groupe]);
                    foreach($msgsGroupe as $mg) $em->remove($mg);
                    
                    $em->remove($groupe);
                }
            }

            // B. Suppression des tâches
            $tachesAssignees = $tacheRepo->findBy(['aidantAffecte' => $user]);
            foreach ($tachesAssignees as $tache) {
                $tache->setAidantAffecte(null);
                $tache->setFaite(false);
            }

            // C. Suppression des services
            $servicesCrees = $serviceRepo->findBy(['aidant' => $user]);
            foreach ($servicesCrees as $service) {
                $em->remove($service); // Cascade souvent vers la Tache liée si configuré, sinon :
                if ($service->getTache()) $em->remove($service->getTache());
            }
        }

        // On verifie si l'utilisateur est un Professionnel
        if ($user instanceof Professionnel) {
            // A. Récupération de tous les avantages créés par ce Pro
            $avantages = $avantageRepo->findBy(['proprietaire' => $user]);
            
            $achatRepo = $em->getRepository(AchatAvantage::class);
            foreach ($avantages as $av) {
                // REMBOURSEMENT DES AIDANTS POUR CHAQUE AVANTAGE SUPPRIMÉ
                // On récupère les aidants qui possèdent cet avantage
                $achats = $achatRepo->findBy(['avantage' => $av]);
                foreach ($achats as $achat) {
                    $aidant = $achat->getAidant();
                    
                    if ($aidant) {
                        // On rembourse l'aidant pour cet achat spécifique
                        $nouveauSolde = $aidant->getPts() + $av->getPrix();
                        $aidant->setPts($nouveauSolde);
                        $em->persist($aidant);
                    }
                }
                // Suppression de l'avantage
                $em->remove($av);
            }
        }

        // 5. On supprime l'utilisateur de la base de données
        $em->remove($user);
        $em->flush();   

        return new JsonResponse(['status' => 'Compte supprimé avec succès']);
    }

    /**
     * Endpoint: POST /api/password_modif
     * Utilisation (exemple dans Tests/Accounts/ModifyAccountPassword.http) :
     * - Header: Authorization: Bearer <token> (obligatoire)
     * - Body JSON: { "old_password": "...", "new_password": "..." }
     *
     * Comportement :
     * - 401 si utilisateur non identifié
     * - 400 si données incomplètes
     * - 403 si ancien mot de passe incorrect
     * - 200 si modification réussie
     */
    #[Route('/api/password_modif', name: 'api_modif_password', methods: ['POST'])]
    public function modif_password(#[CurrentUser] Utilisateur $user, Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): JsonResponse
    {
        // 1. On vérifie l'authentification
        if (null === $user) {
            return $this->json(['error' => 'Utilisateur non identifié (Token manquant ou invalide)'], 401);
        }

        // 2. On récupère les données (ancien et nouveau mdp requis)
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['old_password']) || !isset($data['new_password'])) {
            return $this->json(['error' => 'Données incomplètes'], 400);
        }

        // 3. On vérifie que l'ancien mot de passe est correct
        if (!$hasher->isPasswordValid($user, $data['old_password'])) {
            return $this->json(['error' => 'Mot de passe actuel incorrect'], 403);
        }

        // 4. On hash le nouveau mot de passe et on met à jour l'utilisateur
        $newPassword = $hasher->hashPassword($user, $data['new_password']);
        $user->setPassword($newPassword);
        
        $em->flush();

        return new JsonResponse(['status' => 'Mot de passe modifié avec succès']);
    }
}                   