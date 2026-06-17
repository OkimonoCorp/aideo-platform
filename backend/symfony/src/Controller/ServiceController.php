<?php

namespace App\Controller;

use App\Entity\Aidant;
use App\Entity\Service;
use App\Entity\Tache;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Security\Voter\OwnershipVoter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/services')]
#[IsGranted('ROLE_AIDANT')]
class ServiceController extends AbstractController
{
    /**
     * Endpoint: POST /api/services
     * Test associé: Tests/Services/CreateService.http
     * - Méthode: POST
     * - Header: Authorization: Bearer <token>, Content-Type: application/json
     * - Body JSON attendu:
     *   { "nom", "description", "date" (ISO), "duree", "maxDemandeurs", "latitude", "longitude", "type" }
     * - Comportement: crée une Tache + Service, l'aidant créateur est affecté immédiatement à la tâche
     * - Réponse: 201 { "id": <serviceId> } ou 4xx en cas d'erreur
     */
    #[Route('', name: 'api_service.creation', methods: ['POST'])]
    public function creation(#[CurrentUser] Aidant $aidant,Request $request,EntityManagerInterface $em): JsonResponse
    {
        // 1. Récupération des données JSON
        $data = json_decode($request->getContent(), true);

        // 2. Création de l'entité Tache
        $tache = new Tache(
            $data['nom'],
            $data['description'],
            new \DateTime($data['date']),
            $data['duree'],
            null
        );

        // 3. Création de l'entité Service
        $service = new Service(
            $tache,
            $data['maxDemandeurs'],
            $data['latitude'],
            $data['longitude'],
            $aidant,
            $data['type']
        );

        // 4. On affecte l'aidant créateur à la tâche immédiatement
        $service->getTache()->setAidantAffecte($aidant);

        // 5. Persistance des deux entités et sauvegarde
        $em->persist($tache);
        $em->persist($service);
        $em->flush();

        return new JsonResponse([
            'id' => $service->getId(),
        ], 201);
    }

    /**
     * Méthode utilitaire:
     * - distance(lat1, lon1, lat2, lon2): calcule la distance en mètres entre deux points GPS
     *   (Formule de Haversine utilisée dans la recherche de services autour d'un point)
     */
    private function distance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371000; // Rayon de la terre en mètres

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a =
            sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Endpoint: GET /api/services/{id}
     * Test associé: Tests/Services/GetServiceByID.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Paramètre: id (entier)
     * - Retour: détail du service + tâche associée (id, nom, description, date, durée, aidant, etc.)
     * - Codes: 200 normal, 404 si tâche manquante
     */
    #[Route('/{id}', name: 'api_service.get', methods: ['GET'])]
    public function getService(Service $service): JsonResponse
    {
        // 1. Récupération de la tâche liée
        $tache = $service->getTache();

        // 2. Vérification de l'intégrité des données
        if (!$tache) {
            return new JsonResponse(null, 404);
        }

        $listeCandidats = [];
        foreach ($service->getCandidats() as $candidat) {
            $listeCandidats[] = [
                'id' => $candidat->getId(),
                'pseudo' => $candidat->getPseudo(),
                'prenom' => $candidat->getPrenom(),
                'nom' => $candidat->getNom(),
            ];
        }

        // 3. Construction de la réponse détaillée
        return new JsonResponse([
            'service' => [
                'id' => $service->getId(),
                'maxDemandeurs' => $service->getMaxDemandeurs(),
                'latitude' => $service->getLatitude(),
                'longitude' => $service->getLongitude(),
                'totalCandidats' => count($service->getCandidats()),
                'candidats' => $listeCandidats,
                'type' => $service->getType(),
                'aidant' => [
                    'id' => $service->getAidant()->getId(),
                ],
                'tache' => [
                    'id' => $tache->getId(),
                    'nom' => $tache->getNom(),
                    'description' => $tache->getDescription(),
                    'date' => $tache->getDate() ? $tache->getDate()->format('Y-m-d H:i:s') : null,
                    'heureDebut' => $tache->getHeureDebut(),
                    'duree' => $tache->getDuree(),
                    'faite' => $tache->isFaite(),
                    'aidantAffecte' => $tache->getAidantAffecte()?->getId(),
                ],
            ],
        ]);
    }

    /**
     * Endpoint: POST /api/services/map
     * Test associé: Tests/Services/GetServicesMap.http
     * - Méthode: POST
     * - Header: Authorization: Bearer <token>, Content-Type: application/json
     * - Body JSON: { "latitude": <float>, "longitude": <float>, "rayon": <mètres> }
     * - Comportement: filtre les services non faits, dans le rayon donné, non complets; calcule distance via Haversine
     * - Retour: liste d'objets { id, nom, distance, totalCandidat, maxDemandeurs, description, longitude, latitude }
     */
    #[Route('/map', methods: ['POST'])]
    #[IsGranted('ROLE_AIDANT')]
    public function liste(#[CurrentUser] Aidant $aidant,Request $request,EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $lat = $data['latitude'];
        $lng = $data['longitude'];
        $rayon = $data['rayon'];

        // Récupération de tous les services
        $services = $em->getRepository(Service::class)->findAll();
        $userServices = [];
        $otherServices = [];

        // Filtrage manuel des résultats
        foreach ($services as $service) {
            $tache = $service->getTache();

            // La tâche doit exister et ne pas être déjà faite
            if (!$tache || $tache->isFaite()) {
                continue;
            }

            //Un service la date de la tâche est passée ne doit pas être proposé sauf si l'aidant est owner ou candidat
            $now = new \DateTime();
            $isOwner = $service->getAidant()->getId() === $aidant->getId();
            $isCandidat = $service->getCandidats()->contains($aidant);
            if ($tache->getDate() < $now && !$isOwner && !$isCandidat) {
                continue;
            }

            // Calcul de la distance géodésique
            $distance = $this->distance(
                $lat,
                $lng,
                $service->getLatitude(),
                $service->getLongitude()
            );

            if ($distance > $rayon) {
                continue;
            }

            // Service complet, sauf si l'aidant est owner ou candidat
            $isOwner = $service->getAidant()->getId() === $aidant->getId();
            $isCandidat = $service->getCandidats()->contains($aidant);

            if (
                count($service->getCandidats()) >= $service->getMaxDemandeurs()
                && !$isOwner
                && !$isCandidat
            ) {
                continue;
            }

            $serviceData = [
                'id' => $service->getId(),
                'idTache' => $tache->getId(),
                'nom' => $tache->getNom(),
                'distance' => round($distance),
                'totalCandidat' => count($service->getCandidats()),
                'maxDemandeurs' => $service->getMaxDemandeurs(),
                'description' => $service->getTache()->getDescription(),
                'longitude' => $service->getLongitude(),
                'latitude' => $service->getLatitude(),
                'type' => $service->getType(),
                'idCreateur' => $service->getAidant()->getId(),
                'estInscrit' => $isCandidat,
            ];

            if ($isOwner) {
                $userServices[] = $serviceData;
            } else {
                $otherServices[] = $serviceData;
            }
        }

        return new JsonResponse([
            'userServices' => $userServices,
            'otherServices' => $otherServices,
        ]);
    }

    /**
     * Endpoint: DELETE /api/services/{id}
     * Test associé: Tests/Services/DeleteService.http
     * - Méthode: DELETE
     * - Header: Authorization: Bearer <token>
     * - Comportement: Anti-IDOR — seul le créateur (aidant) peut supprimer son service
     * - Réponse: 204 si suppression réussie, AccessDeniedException sinon
     */
    #[Route('/{id}', name: 'api_service.suppression', methods: ['DELETE'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'service', message: 'Vous ne pouvez pas supprimer ce service.')]
    public function suppression(Service $service,EntityManagerInterface $em): JsonResponse
    {
        // Suppression et flush
        $em->remove($service);
        $em->flush();

        return new JsonResponse(null, 204);
    }

    /**
     * Endpoint: POST /api/services/inscription/{id}
     * Test associé: Tests/Accounts/InscriptionService.http
     * - Méthode: POST
     * - Header: Authorization: Bearer <token>
     * - Comportement:
     *   - vérifie que la tâche/service est disponible (non fait)
     *   - vérifie que le service admet des inscriptions (maxDemandeurs non null)
     *   - empêche les doublons et la surcharge
     *   - ajoute l'aidant aux candidats et lui associe la tâche
     * - Réponse: 200 { message } ou 4xx en cas d'erreur (indisponible, déjà inscrit, complet, ...)
     */
    #[Route('/inscription/{id}', name: 'api_service.inscription', methods: ['POST'])]
    public function inscription(#[CurrentUser] Aidant $aidant,Service $service,EntityManagerInterface $em): JsonResponse
    {

        $tache = $service->getTache();

        // Validation : Le service est-il toujours d'actualité ?
        if (!$tache || $tache->isFaite()) {
            return new JsonResponse(['error' => 'Service indisponible'], 400);
        }

        // L'aidant ne peut pas s'inscrire à son propre service
        if ($service->getAidant() === $aidant) {
            return new JsonResponse(['error' => 'Vous ne pouvez pas vous inscrire à votre propre service'], 400);
        }

        // Anti-Doublon : L'aidant est-il déjà inscrit ?
        if ($service->getCandidats()->contains($aidant)) {
            return new JsonResponse(['error' => 'Déjà inscrit'], 400);
        }

        // Vérification de la capacité
        if (count($service->getCandidats()) >= $service->getMaxDemandeurs()) {
            return new JsonResponse(['error' => 'Nombre maximum de candidats atteint'], 400);
        }

        // 5. Inscription : Ajout aux candidats et liaison de la tâche
        $service->addCandidat($aidant);
        $aidant->addTache($tache);

        $em->flush();

        return new JsonResponse([
            'message' => 'Inscription réussie'
        ], 200);
    }

    /**
     * Endpoint: DELETE /api/services/desinscription/{id}
     * Test associé: Tests/Accounts/DesinscriptionService.http
     * - Méthode: DELETE
     * - Header: Authorization: Bearer <token>
     * - Comportement:
     *   - vérifie que le service est bien de type 'proposition'
     *   - vérifie que l'aidant est inscrit
     *   - retire l'aidant des candidats
     * - Réponse: 200 { message } ou 4xx en cas d'erreur
     */
    #[Route('/desinscription/{id}', name: 'api_service.desinscription', methods: ['DELETE'])]
    public function desinscription(#[CurrentUser] Aidant $aidant,Service $service,EntityManagerInterface $em): JsonResponse
    {
        // Vérification que l'utilisateur est bien inscrit
        if (!$service->getCandidats()->contains($aidant)) {
            return new JsonResponse(['error' => 'Vous n’êtes pas inscrit à ce service'], 400);
        }

        // Suppression de l'inscription
        $service->removeCandidat($aidant);

        $em->flush();

        return new JsonResponse([
            'message' => 'Désinscription effectuée'
        ], 200);
    }


    /**
     * Endpoint: POST /api/services/validation/{id}
     * Test associé: Tests/Controller/ServiceValidationTest.php
     * - Méthode: POST
     * - Header: Authorization: Bearer <token>
     * - Body JSON: { "candidat_id": <int> } (Requis uniquement si le service est de type 'demande')
     * - Comportement:
     * - Sécurisé par Voter : seul le bénéficiaire du service (Créateur ou Candidat) peut valider
     * - Identifie le travailleur à récompenser selon le type (Demande -> Candidat / Proposition -> Créateur)
     * - Calcule les points : Base (50) + Durée (1pt/min)
     * - Crédite les points à l'aidant, marque la tâche comme faite et assigne l'aidant affecté
     * - Réponse: 200 { message, points } ou 4xx en cas d'erreur (Voter, ID manquant, introuvable...)
     */
    #[Route('/validation/{id}', name: 'api_service.validation_finale', methods: ['POST'])]
    #[IsGranted(OwnershipVoter::VALIDATE, subject: 'service', message: 'Vous n\'avez pas le droit de valider ce service.')]
    public function validation(Service $service,Request $request,EntityManagerInterface $em): JsonResponse
    {
        /** @var Aidant $user */ // On sait que c'est le bénéficiaire validé par le Voter
        $user = $this->getUser();

        $tache = $service->getTache();
        $typeService = $service->getType();

        $aidantA_Recompenser = null;

        // Gestion du cas selon le type de service

        if ($typeService === 'demande') {
            // CAS 1 : DEMANDE (Créateur valide Candidat)
            $data = json_decode($request->getContent(), true);
            $candidatId = $data['candidat_id'] ?? null;

            if (!$candidatId) {
                return new JsonResponse(['error' => 'Veuillez indiquer le candidat (candidat_id).'], 400);
            }

            foreach ($service->getCandidats() as $c) {
                if ($c->getId() === (int)$candidatId) {
                    $aidantA_Recompenser = $c;
                    break;
                }
            }
        }
        elseif ($typeService === 'proposition') {
            // CAS 2 : PROPOSITION (Candidat valide Créateur)
            $aidantA_Recompenser = $service->getAidant();
            // Ajouter le validateur à la liste des validations
            $service->addValidation($user);
        }

        if (!$aidantA_Recompenser) {
            return new JsonResponse(['error' => 'Aidant à récompenser introuvable.'], 404);
        }

        // Calcul des points
        $pointsBase = 50;
        $pointsDuree = ($tache->getDuree() ?? 0) * 1;
        $totalPoints = $pointsBase + $pointsDuree;

        // Paiment des points
        $aidantA_Recompenser->setPts($aidantA_Recompenser->getPts() + $totalPoints);

        // Pour proposition, marquer comme faite seulement si tous les candidats ont validé
        if ($typeService === 'proposition') {
            if ($service->getValidations()->count() === $service->getCandidats()->count()) {
                $tache->setFaite(true);
                $tache->setAidantAffecte($aidantA_Recompenser);
            }
        } else {
            // Pour demande, marquer immédiatement comme faite
            $tache->setFaite(true);
            $tache->setAidantAffecte($aidantA_Recompenser);
        }

        $em->flush();

        return new JsonResponse([
            'message' => 'Service validé avec succès !',
            'points' => $totalPoints
        ]);
    }

}
