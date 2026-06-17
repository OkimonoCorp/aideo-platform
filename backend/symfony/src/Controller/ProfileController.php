<?php

namespace App\Controller;

use App\Entity\Adresse;
use App\Entity\Aidant;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Security\Voter\OwnershipVoter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/profile')]
class ProfileController extends AbstractController
{
    /**
     * Endpoint: GET /api/profile
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Retour: attributs publics de l'utilisateur connecté.
     *   - Pour Aidant: email, nom, telephone, prenom, points, pseudo, adresse
     *   - Pour Professionnel: email, nom, telephone, nomContact, descriptionEntr, adresses
     */
    #[Route('', name: 'api_profile.recuperation', methods: ['GET'])]
    public function profile_recuperation(#[CurrentUser] Utilisateur $user): JsonResponse
    {
        // 1. Récupération des attributs communs à tous les utilisateurs
        $attributes = [
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'telephone' => $user->getNumTel(),
            'type' => in_array('ROLE_ADMIN', $user->getRoles()) ? 'admin' : ( $user instanceof Professionnel ? 'professionnel' : ( $user instanceof Aidant ? 'aidant' : 'utilisateur' ) ),
        ];

        // 2. Si l'utilisateur est un Aidant, on ajoute ses champs spécifiques
        if ($user instanceof Aidant) {
            $attributes += [
                'prenom' => $user->getPrenom(),
                'points' => $user->getPts(),
                'pseudo' => $user->getPseudo(),
                'adresse' => $user->getAdresse(),
            ];
        }

        // 3. Si l'utilisateur est un Professionnel, on ajoute ses champs spécifiques
        if ($user instanceof Professionnel) {
            $attributes += [
                'nomContact' => $user->getNomContact(),
                'descriptionEntr' => $user->getDescriptionEntr(),
                'adresses' => $user->getAdresses()->map(fn(Adresse $adresse) => [
                    'id' => $adresse->getId(),
                    'libelle' => $adresse->getAdresse(), // Ou getRue(), getVille() selon ton entité Adresse
                ])->toArray(),
            ];
        }

        return new JsonResponse($attributes);
    }

    /**
     * Endpoint: PUT /api/profile
     * Test associé: Tests/Accounts/ModifyAccount.http
     * - Méthode: PUT
     * - Header: Content-Type: application/json + Authorization: Bearer <token>
     * - Body JSON: champs modifiables (email, nom, telephone, puis selon type: prenom, pseudo, adresse, nomContact, descriptionEntr)
     * - Réponses:
     *   - 204 : modification réussie (pas de contenu)
     *   - 400/401 selon validation/autentification (gérée par le framework)
     */
    #[Route('', name: 'api_profile.modification', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function profile_modification(#[CurrentUser] Utilisateur $user,Request $request,EntityManagerInterface $em): JsonResponse
    {
        // 1. On récupère les données JSON de la requête
        $data = json_decode($request->getContent(), true);

        // 2. Mise à jour des champs communs
        $user
            ->setEmail($data['email'] ?? $user->getEmail())
            ->setNom($data['nom'] ?? $user->getNom())
            ->setNumTel($data['telephone'] ?? $user->getNumTel());

        // 3. Mise à jour spécifique pour un Aidant
        if ($user instanceof Aidant) {
            $user
                ->setPrenom($data['prenom'] ?? $user->getPrenom())
                ->setPseudo($data['pseudo'] ?? $user->getPseudo())
                ->setAdresse($data['adresse'] ?? $user->getAdresse());
        }

        // 4. Mise à jour spécifique pour un Professionnel
        if ($user instanceof Professionnel) {
            $user
                ->setNomContact($data['nomContact'] ?? $user->getNomContact())
                ->setDescriptionEntr($data['descriptionEntr'] ?? $user->getDescriptionEntr());
        }

        // 5. Sauvegarde des modifications en base de données
        $em->flush();

        return new JsonResponse(null, 204);
    }

    /**
     * Endpoint: DELETE /api/profile/adresses/{id}
     * - Méthode: DELETE
     * - Header: Authorization: Bearer <token> (ROLE_PRO requis)
     * - Paramètre: id de l'adresse
     * - Comportement: Anti-IDOR — seul le professionnel propriétaire peut supprimer son adresse
     * - Réponse: 204 si suppression réussie, AccessDeniedException sinon
     */
    #[Route('/adresses/{id}', name: 'api_profile.adresse_suppression', methods: ['DELETE'])]
    #[IsGranted('ROLE_PRO')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'adresse', message: 'Vous ne pouvez pas supprimer cette adresse.')]
    public function profile_adresse_suppression(Adresse $adresse,EntityManagerInterface $em): JsonResponse
    {
        // Suppression de l'adresse
        $em->remove($adresse);
        $em->flush();

        return new JsonResponse(null, 204);
    }

    /**
     * Endpoint: POST /api/profile/adresses
     * - Méthode: POST
     * - Header: Content-Type: application/json + Authorization: Bearer <token> (ROLE_PRO requis)
     * - Body JSON: { "adresse": "..." }
     * - Comportement: crée une nouvelle adresse liée au professionnel connecté
     * - Réponse: 204 si succès
     */
    #[Route('/adresses', name: 'api_profile.adresse_ajout', methods: ['POST'])]
    #[IsGranted('ROLE_PRO')]
    public function profile_adresse_ajout(#[CurrentUser] Professionnel $pro,Request $request,EntityManagerInterface $em): JsonResponse
    {
        // 1. Récupération des données
        $data = json_decode($request->getContent(), true);

        // 2. Création de la nouvelle entité Adresse liée au professionnel
        $adresse = new Adresse($data['adresse'], $pro);

        // 3. Sauvegarde
        $em->persist($adresse);
        $em->flush();

        return new JsonResponse(null, 204);
    }

    /**
     * Endpoint: PUT /api/profile/adresses/{id}
     * - Méthode: PUT
     * - Header: Content-Type: application/json + Authorization: Bearer <token> (ROLE_PRO requis)
     * - Body JSON: { "adresse": "..." }
     * - Comportement: Anti-IDOR — seul le professionnel propriétaire peut modifier son adresse
     * - Réponse: 204 si modification réussie, AccessDeniedException sinon
     */
    #[Route('/adresses/{id}', name: 'api_profile.adresse_modification', methods: ['PUT'])]
    #[IsGranted('ROLE_PRO')]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'adresse', message: 'Vous ne pouvez pas modifier cette adresse.')]
    public function profile_adresse_modification(Adresse $adresse, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // 1. Récupération des données JSON
        $data = json_decode($request->getContent(), true);

        // 2. Mise à jour de l'adresse
        $adresse->setAdresse($data['adresse'] ?? $adresse->getAdresse());

        // 3. Sauvegarde
        $em->flush();

        return new JsonResponse(null, 204);
    }

    /**
     * Endpoint: GET /api/profile/type
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Retour: JSON contenant le type de l'utilisateur ('admin', 'professionnel', 'aidant' ou 'utilisateur')
     * - Utilité: Permet au front-end d'adapter l'interface selon le rôle connecté.
     */
    #[Route('/type', name: 'api_profile.get_type', methods: ['GET'])]
    public function get_type(#[CurrentUser] Utilisateur $user): JsonResponse
    {
        // 1. Vérification prioritaire : Est-ce un Administrateur ?
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['type' => 'admin']);
        }

        // 2. Vérification par instance de classe : Est-ce un Professionnel ?
        if ($user instanceof Professionnel) {
            return new JsonResponse(['type' => 'professionnel']);
        }

        // 3. Vérification par instance de classe : Est-ce un Aidant ?
        if ($user instanceof Aidant) {
            return new JsonResponse(['type' => 'aidant']);
        }

        // 4. Cas imprévu : type inconnu
        return new JsonResponse(['error' => 'Type d\'utilisateur inconnu'], 500);
    }

    /**
     * POST photo de profil (auth)
     * - Form-data: photo (fichier image)
     * - Restrictions: types MIME autorisés (image/jpeg, image/png, image/webp), taille max 2MB
     * - Stockage: en base64 dans la BDD
     * - Réponses:
     *   - 200 : photo mise à jour
     *   - 400 : fichier manquant
     *   - 413 : fichier trop volumineux
     *   - 415 : type de fichier interdit
     */
    #[Route('/photo_profil', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function setPhotoProfil(#[CurrentUser] Utilisateur $user, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $file = $request->files->get('photo');

        if (!$file) {
            return $this->json(['error' => 'Aucun fichier fourni'], 400);
        }

        if (!$file->isValid()) {
            return new JsonResponse([
                'error' => 'Upload invalide',
                'code' => $file->getError()
            ], 400);
        }

        $allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file->getMimeType(), $allowedMime, true)) {
            return new JsonResponse(['error' => 'Type de fichier interdit'], 415);
        }

        if ($file->getSize() > 2_000_000) {
            return new JsonResponse(['error' => 'Fichier trop volumineux'], 413);
        }

        // stocke en base64
        $photoData = base64_encode(file_get_contents($file->getPathname()));
        $user->setPhotoProfil($photoData);
        $user->setPhotoProfilMime($file->getMimeType());

        $em->flush();

        return new JsonResponse(['status' => 'Photo mise à jour']);
    }

    /**
     * GET photo de profil (auth)
     * - Retour: contenu binaire de la photo avec header Content-Type approprié
     * - Réponses:
     *   - 200 : photo retournée
     *   - 404 : pas de photo définie
     */
    #[Route('/photo_profil', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPhotoProfil(#[CurrentUser] Utilisateur $user): Response
    {
        $photoBase64 = $user->getPhotoProfil();
        if (!$photoBase64) {
            return new Response(null, 204);
        }

        $photo = base64_decode($photoBase64);

        return new Response($photo, 200, [
            'Content-Type' => $user->getPhotoProfilMime(),
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    /**
     * GET photo publique
     * - Paramètre: id de l'utilisateur
     * - Retour: contenu binaire de la photo avec header Content-Type approprié
     * - Réponses:
     *   - 200 : photo retournée
     *   - 404 : utilisateur ou photo non trouvée
     */
    #[Route('/photo_profil/{id}', methods: ['GET'])]
    public function getPhotoProfilPublic(int $id, EntityManagerInterface $em): Response
    {
        $user = $em->getRepository(Utilisateur::class)->find($id);
        if (!$user || !$user->getPhotoProfil()) {
            return new Response(null, 204);
        }

        $photo = base64_decode($user->getPhotoProfil());

        return new Response($photo, 200, [
            'Content-Type' => $user->getPhotoProfilMime(),
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
