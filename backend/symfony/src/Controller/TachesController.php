<?php

namespace App\Controller;

use App\Entity\Aidant;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Security\Voter\OwnershipVoter;
use App\Entity\Groupe;
use App\Entity\Utilisateur;
use App\Entity\Tache;
use App\Repository\ServiceRepository;
use App\Repository\TacheRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/taches')]
#[IsGranted('ROLE_AIDANT')]
class TachesController extends AbstractController
{
    /**
     * Endpoint: GET /api/taches
     * - Méthode: GET
     * - Header: Authorization: Bearer <token> (ROLE_AIDANT requis)
     * - Retour: liste des tâches assignées à l'utilisateur + tâches des services où il est candidat (triées par date)
     * - Réponse: 200 => tableau [{id, nom, description, date, duree, faite}, ...]
     */
    #[Route('', name: 'api_taches.liste', methods: ['GET'])]
    public function liste_taches(#[CurrentUser] ?Utilisateur $user, TacheRepository $tacheRepository, EntityManagerInterface $em) : JsonResponse
    {
        // 1. Récupération des tâches directement affectées à l'utilisateur
        $tachesAffectees = $tacheRepository->findBy(
            ['aidantAffecte' => $user],
            ['date' => 'ASC']
        );

        // 2. Récupération des tâches des services où l'utilisateur est candidat
        $tachesServices = [];
        if ($user instanceof Aidant) {
            $tachesServices = $em->createQueryBuilder()
                ->select('t')
                ->from(Tache::class, 't')
                ->innerJoin('t.service', 's')
                ->innerJoin('s.candidats', 'c')
                ->where('c.id = :userId')
                ->setParameter('userId', $user->getId())
                ->getQuery()
                ->getResult();
        }

        // 3. Fusion des deux listes en évitant les doublons (utiliser l'ID comme clé)
        $tachesUniques = [];
        foreach (array_merge($tachesAffectees, $tachesServices) as $tache) {
            $tachesUniques[$tache->getId()] = $tache;
        }

        // 4. Tri par date
        usort($tachesUniques, function(Tache $a, Tache $b) {
            return $a->getDate() <=> $b->getDate();
        });

        // 5. Formatage des données
        $data = [];
        foreach ($tachesUniques as $tache) {
            $data[] = [
                'id' => $tache->getId(),
                'nom' => $tache->getNom(),
                'description' => $tache->getDescription(),
                'date' => $tache->getDate()->format('Y-m-d H:i:s'),
                'duree' => $tache->getDuree(),
                'faite' => $tache->isFaite(),
            ];
        }

        return $this->json($data);
    }

    /**
     * Endpoint: GET /api/taches/{id}
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Paramètre: id (entier)
     * - Comportement: Anti-IDOR — seul l'aidant affecté peut voir la tâche
     * - Réponses:
     *   - 200 => détail de la tâche
     *   - 403 => accès interdit
     *   - 404 => tâche introuvable
     */
    #[Route('/{id}', name: 'api_taches.detail', methods: ['GET'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'tache', message: 'Accès interdit')]
    public function detail_tache(Tache $tache) : JsonResponse{
        return $this->json([
            'id' => $tache->getId(),
            'nom' => $tache->getNom(),
            'description' => $tache->getDescription(),
            'date' => $tache->getDate()->format('Y-m-d H:i:s'),
            'duree' => $tache->getDuree(),
            'faite' => $tache->isFaite(),
            'aidantAffecte' => $tache->getAidantAffecte() ? $tache->getAidantAffecte()->getId() : null,
        ]);
    }

    /**
     * Endpoint: POST /api/taches
     * - Méthode: POST
     * - Header: Content-Type: application/json, Authorization: Bearer <token>
     * - Body JSON attendu: { "nom", "description", "date" (ISO), "duree" }
     * - Comportement: crée une Tache et l'affecte à l'aidant connecté
     * - Réponse: 200/201 ou message d'erreur
     */
    #[Route('', name: 'api_taches.creation', methods: ['POST'])]
    public function creer_tache(#[CurrentUser] ?Aidant $user, Request $request, EntityManagerInterface $em){
        // 1. Récupération des données
        $data = json_decode($request->getContent(), true);

        // 2. Création de l'entité
        $task = new Tache(
            $data['nom'],
            $data['description'],
            new \DateTime($data['date']),
            $data['duree'],
            $user
        );

        // 3. Assignation à l'utilisateur connecté
        $task->setAidantAffecte($user);

        // 4. Sauvegarde
        $em->persist($task);
        $em->flush();

        return $this->json(['message' => 'Tache créée avec succès']);
    }

    /**
     * Endpoint: PUT /api/taches/{id}
     * - Méthode: PUT
     * - Header: Content-Type: application/json, Authorization: Bearer <token>
     * - Body JSON: champs modifiables (nom, description, date, duree)
     * - Comportement: Anti-IDOR — seul l'aidant affecté peut modifier
     * - Réponses:
     *   - 200 => modification réussie
     *   - 403 => accès interdit
     */
    #[Route('/{id}', name: 'api_taches.modification', methods: ['PUT'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'tache', message: 'Vous n\'avez pas le droit de modifier cette tâche')]
    public function modifier_tache(Tache $tache, Request $request, EntityManagerInterface $em, ServiceRepository $serviceRepo){

        // 1. Récupération et mise à jour des données
        $data = json_decode($request->getContent(), true);
        $tache->setNom($data['nom'] ?? $tache->getNom());
        $tache->setDescription($data['description'] ?? $tache->getDescription());

        // Gestion propre de la date si elle est fournie
        if (isset($data['date'])) {
            $tache->setDate(new \DateTime($data['date']));
        }

        $tache->setDuree($data['duree'] ?? $tache->getDuree());

        if (isset($data['service_id'])) {
            // 1. On cherche le service visé
            $nouveauService = $serviceRepo->find($data['service_id']);

            if (!$nouveauService) {
                return $this->json(['error' => 'Service introuvable'], 404);
            }

            /** @var \App\Entity\Utilisateur $user */
            $user = $this->getUser();

            // Si le propriétaire du service n'est pas l'utilisateur connecté => ERREUR
            if ($nouveauService->getAidant()->getId() !== $user->getId()) {
                return $this->json(['error' => 'Action interdite : Vous ne possédez pas ce service.'], 403);
            }

            // 3. Si c'est bon, on déplace la tâche
            $tache->setService($nouveauService);
        }

        // 2. Sauvegarde
        $em->flush();

        return $this->json(['message' => 'Tâche modifiée avec succès']);
    }

    /**
     * Endpoint: DELETE /api/taches/{id}
     * - Méthode: DELETE
     * - Header: Authorization: Bearer <token>
     * - Comportement: Anti-IDOR — seul l'aidant affecté peut supprimer la tâche
     * - Réponses:
     *   - 204/200 => suppression réussie
     *   - 403 => accès interdit
     */
    #[Route('/{id}', name: 'api_taches.suppression', methods: ['DELETE'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'tache', message: 'Vous n\'avez pas le droit de supprimer cette tâche')]
    public function supprimer_tache(Tache $tache, EntityManagerInterface $em){
        // Suppression physique
        $em->remove($tache);
        $em->flush();

        return $this->json(['message' => 'Tâche supprimée avec succès']);
    }

    /**
     * Endpoint: PATCH /api/taches/statut/{id}
     * - Méthode: PATCH
     * - Header: Authorization: Bearer <token>
     * - Comportement: bascule l'état 'faite' de la tâche (toggle) — Anti-IDOR appliqué
     * - Réponse: 200 => { message, faite }
     */
    #[Route('/statut/{id}', name: 'api_taches.change_statut', methods: ['PATCH'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'tache', message: 'Vous n\'avez pas le droit de modifier cette tâche')]
    public function changer_statut_tache(Tache $tache, EntityManagerInterface $em): JsonResponse {
        // 1. La logique de bascule (Toggle) : inverse l'état actuel
        $nouvelEtat = !$tache->isFaite();
        $tache->setFaite($nouvelEtat);

        // 2. Sauvegarde
        $em->flush();

        // 3. On renvoie le nouvel état pour mise à jour UI immédiate
        return $this->json([
            'message' => $nouvelEtat ? 'Tâche validée' : 'Tâche dévalidée',
            'faite' => $nouvelEtat
        ]);
    }

    /**
     * Endpoint: POST /api/taches/taches_dun_groupe
     * - Méthode: POST
     * - Header: Content-Type: application/json, Authorization: Bearer <token>
     * - Body JSON: { "id_groupe": <id> }
     * - Comportement: vérifie que l'utilisateur est membre du groupe puis retourne toutes les tâches des membres
     * - Réponses:
     *   - 200 => tableau des tâches du groupe
     *   - 401/403/404 => erreurs d'auth/autorisation/ressource
     */
    #[Route('/taches_dun_groupe', name: 'api_taches_dun_groupe', methods: ['POST'])]
    public function taches_dun_groupe(#[CurrentUser] ?Utilisateur $user, Request $request, EntityManagerInterface $em)
    {
        // 1. Vérifier l'authentification
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);

        // 2. Vérifier l'ID du groupe
        if (!isset($data['id_groupe'])) {
            return $this->json(['error' => 'L\'ID du groupe est manquant'], 400);
        }

        $groupeId = $data['id_groupe'];

        // 3. Récupération du groupe
        $groupe = $em->getRepository(\App\Entity\Groupe::class)->find($groupeId);

        if (!$groupe) {
            return $this->json(['error' => 'Groupe introuvable'], 404);
        }

        // 4. Anti-IDOR : L'utilisateur doit être membre du groupe
        if (!$groupe->getMembres()->contains($user)) {
            return $this->json(['error' => 'Accès interdit à ce groupe'], 403);
        }

        // 5. Requête complexe : Récupérer les tâches via les aidants du groupe
        $taches = $em->getRepository(Tache::class)->createQueryBuilder('t')
            ->innerJoin('t.aidantAffecte', 'a')
            ->innerJoin('a.groupes', 'g')
            ->where('g.id = :id')
            ->setParameter('id', $groupeId)
            ->getQuery()
            ->getResult();

        // 6. Formatage de la réponse
        $tableauPourJson = [];

        foreach ($taches as $tache) {
            $aidant = $tache->getAidantAffecte();

            $ligneTache = [
                'id' => $tache->getId(),
                'nom' => $tache->getNom(),
                'description' => $tache->getDescription(),
                'date_limite' => $tache->getDate()->format('d/m/Y H:i'),
                'duree' => $tache->getDuree(),
                'faite' => $tache->isFaite(),
                'aidant_nom' => $aidant?->getNom(),
                'aidant_prenom' => $aidant?->getPrenom(),
            ];

            $tableauPourJson[] = $ligneTache;
        }

        return $this->json($tableauPourJson);
    }

    /**
     * Endpoint: POST /api/taches/taches_autres_membres
     * - Méthode: POST
     * - Header: Content-Type: application/json, Authorization: Bearer <token>
     * - Body JSON: { "id_groupe": <id> }
     * - Comportement: retourne uniquement les tâches des autres membres du groupe (exclut l'utilisateur connecté)
     * - Réponses:
     *   - 200 => tableau formaté des tâches
     *   - 401/403/404 => erreurs correspondantes
     */
    #[Route('/taches_autres_membres', name: 'api_taches_autres_membres', methods: ['POST'])]
    public function taches_autres_membres(#[CurrentUser] ?Utilisateur $user, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // 1. Vérification auth
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);

        // 2. Vérification ID Groupe
        if (!isset($data['id_groupe'])) {
            return $this->json(['error' => 'L\'ID du groupe est manquant'], 400);
        }

        $groupeId = $data['id_groupe'];

        // 3. Anti-IDOR : On vérifie que l'utilisateur est bien dans ce groupe
        $groupe = $em->getRepository(\App\Entity\Groupe::class)->find($groupeId);

        if (!$groupe) {
            return $this->json(['error' => 'Groupe introuvable'], 404);
        }

        if (!$groupe->getMembres()->contains($user)) {
             return $this->json(['error' => 'Accès interdit à ce groupe'], 403);
        }

        // 4. La Requête filtrée : Tâches du groupe SAUF celles de l'utilisateur connecté
        $taches = $em->getRepository(Tache::class)->createQueryBuilder('t')
            ->innerJoin('t.aidantAffecte', 'a')
            ->innerJoin('a.groupes', 'g')
            ->where('g.id = :groupeId')
            ->andWhere('a.id != :userId')
            ->orderBy('t.date', 'ASC')
            ->setParameter('groupeId', $groupeId)
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getResult();

        // 5. Formatage
        $tableauPourJson = [];

        foreach ($taches as $tache) {
            $aidant = $tache->getAidantAffecte();

            $tableauPourJson[] = [
                'id' => $tache->getId(),
                'nom' => $tache->getNom(),
                'description' => $tache->getDescription(),
                'date_limite' => $tache->getDate()->format('d/m/Y H:i'),
                'duree' => $tache->getDuree(),
                'faite' => $tache->isFaite(),
                'assigne_a' => [
                    'id' => $aidant?->getId(),
                    'nom' => $aidant?->getNom(),
                    'prenom' => $aidant?->getPrenom(),
                ]
            ];
        }

        return $this->json($tableauPourJson);
    }
}
