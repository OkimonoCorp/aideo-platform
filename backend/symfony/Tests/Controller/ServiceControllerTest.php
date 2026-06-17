<?php

namespace App\Tests\Controller;

use App\Entity\Service;
use App\Entity\Tache;
use App\Tests\ApiTestCase;

class ServiceControllerTest extends ApiTestCase
{
    public function testCreationService(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. Action : Création du service via l'API
        $this->client->request('POST', '/api/services', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode([
            'nom' => 'Service Test',
            'description' => 'Desc',
            'date' => '2025-01-01T10:00:00',
            'duree' => 2,
            'maxDemandeurs' => 5,
            'latitude' => 48.8,
            'longitude' => 2.3,
            'type' => 'proposition'
        ]));

        // 3. Vérification : Code 201 (Created)
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function testGetService(): void
    {
        // 1. Préparation : Injection manuelle en BDD
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        $tache = new Tache('Tache', 'Desc', new \DateTime(), 1, null);
        $service = new Service($tache, 5, 48.8, 2.3, $user, 'proposition');
        $tache->setAidantAffecte($user);
        
        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();

        // 2. Action : Récupération via l'API
        $this->client->request('GET', '/api/services/' . $service->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testListeServices(): void
    {
        // 1. Préparation : Création d'un service géolocalisé
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        $tache = new Tache('MapTache', 'Desc', new \DateTime(), 1, null);
        $service = new Service($tache, 5, 48.8, 2.3, $user, 'proposition');
        $tache->setAidantAffecte($user);
        
        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();

        // 2. Action : Recherche (POST /map) dans un rayon donné
        $this->client->request('POST', '/api/services/map', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode([
            'latitude' => 48.8,
            'longitude' => 2.3,
            'rayon' => 1000 // 1km
        ]));
        
        // 3. Vérification : Succès et format JSON
        $this->assertResponseIsSuccessful();
        $this->assertJson($this->client->getResponse()->getContent());
    }

    public function testSuppressionService(): void
    {
        // 1. Préparation : Création de la donnée à supprimer
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        $tache = new Tache('ToDelete', 'Desc', new \DateTime(), 1, null);
        $service = new Service($tache, 5, 48.8, 2.3, $user, 'proposition');
        
        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();

        // 2. Action : Suppression via l'API
        $this->client->request('DELETE', '/api/services/' . $service->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérification : Code 204 (No Content)
        $this->assertEquals(204, $this->client->getResponse()->getStatusCode());
    }

    public function testInscriptionService(): void
    {
        // 1. Préparation : Un créateur et son service
        [$createur, $tokenC] = $this->createAndLoginUser('aidant');
        $tache = new Tache('Inscription', 'Desc', new \DateTime(), 1, null);
        $service = new Service($tache, 5, 48.8, 2.3, $createur, 'proposition');
        
        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();

        // 2. Action : Un candidat s'inscrit
        [$candidat, $token] = $this->createAndLoginUser('aidant');

        $this->client->request('POST', '/api/services/inscription/' . $service->getId(), [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testDesinscriptionService(): void
    {
        // 1. Préparation complexe : Créateurs, Candidats, Service et Inscription préalable
        [$createur, $tokenC] = $this->createAndLoginUser('aidant');
        [$candidat, $token] = $this->createAndLoginUser('aidant');

        $tache = new Tache('Desinscription', 'Desc', new \DateTime(), 1, null);
        $service = new Service($tache, 5, 48.8, 2.3, $createur, 'proposition');
        
        // Inscription manuelle en BDD pour simuler l'état initial
        $service->addCandidat($candidat);

        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();

        // 2. Action : Le candidat demande à se désinscrire
        $this->client->request('DELETE', '/api/services/desinscription/' . $service->getId(), [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }
}