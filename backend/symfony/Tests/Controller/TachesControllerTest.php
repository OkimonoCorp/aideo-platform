<?php

namespace App\Tests\Controller;

use App\Entity\Groupe;
use App\Entity\Tache;
use App\Tests\ApiTestCase;

class TachesControllerTest extends ApiTestCase
{
    public function testCycleDeVieTache(): void
    {
        // 1. Étape CRÉATION (POST)
        [$user, $token] = $this->createAndLoginUser('aidant');

        $this->client->request('POST', '/api/taches', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode([
            'nom' => 'Tache Test',
            'description' => 'Desc',
            'date' => '2030-01-01 10:00:00',
            'duree' => 1
        ]));
        $this->assertResponseIsSuccessful();

        // (Intermédiaire : Récupération de l'ID en base pour la suite)
        $tache = $this->entityManager->getRepository(Tache::class)->findOneBy(['nom' => 'Tache Test']);
        $id = $tache->getId();

        // 2. Étape LECTURE (GET)
        $this->client->request('GET', '/api/taches/' . $id, [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);
        $this->assertResponseIsSuccessful();

        // 3. Étape MODIFICATION (PUT)
        $this->client->request('PUT', '/api/taches/' . $id, [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['nom' => 'Tache Modifiée']));
        $this->assertResponseIsSuccessful();

        // 4. Étape SUPPRESSION (DELETE)
        $this->client->request('DELETE', '/api/taches/' . $id, [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);
        $this->assertResponseIsSuccessful();
    }

    public function testChangerStatutTache(): void
    {
        // 1. Préparation : Une tâche initialisée à "Non Faite"
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        $tache = new Tache('Statut', 'Desc', new \DateTime(), 1, $user);
        $tache->setAidantAffecte($user);
        $tache->setFaite(false);
        
        $this->entityManager->persist($tache);
        $this->entityManager->flush();

        // 2. Action : Bascule du statut (Toggle)
        $this->client->request('PATCH', '/api/taches/statut/' . $tache->getId(), [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);
        
        // 3. Vérification : La tâche doit être passée à TRUE
        $this->assertResponseIsSuccessful();

        $content = $this->client->getResponse()->getContent();
        $data = json_decode($content, true);
        
        $this->assertTrue($data['faite']);
    }

    public function testTachesDunGroupe(): void
    {
        // 1. Préparation : Un groupe, un membre et une tâche liée
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        $groupe = new Groupe();
        $groupe->setNom('Grp Tache');
        $groupe->addMembre($user);
        
        $tache = new Tache('Tache Groupe', 'Desc', new \DateTime(), 1, $user);
        $tache->setAidantAffecte($user);
        
        $this->entityManager->persist($groupe);
        $this->entityManager->persist($tache);
        $this->entityManager->flush();

        // 2. Action : Récupérer toutes les tâches du groupe
        $this->client->request('POST', '/api/taches/taches_dun_groupe', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['id_groupe' => $groupe->getId()]));

        // 3. Vérification
        $this->assertResponseIsSuccessful();
        
        $content = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertGreaterThanOrEqual(1, count($content));
    }

    public function testTachesAutresMembres(): void
    {
        // 1. Préparation complexe :
        // - Moi (connecté)
        // - L'Autre (membre du même groupe)
        // - Une tâche assignée à l'Autre
        [$moi, $token] = $this->createAndLoginUser('aidant');
        [$autre, $tokenB] = $this->createAndLoginUser('aidant');

        $groupe = new Groupe();
        $groupe->setNom('Grp Commun');
        $groupe->addMembre($moi);
        $groupe->addMembre($autre);

        $tacheAutre = new Tache('Tache Autre', 'Desc', new \DateTime(), 1, $autre);
        $tacheAutre->setAidantAffecte($autre);

        $this->entityManager->persist($groupe);
        $this->entityManager->persist($tacheAutre);
        $this->entityManager->flush();

        // 2. Action : Je demande "Quelles sont les tâches des autres ?"
        $this->client->request('POST', '/api/taches/taches_autres_membres', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['id_groupe' => $groupe->getId()]));

        // 3. Vérification : Je dois voir la tâche de l'autre
        $this->assertResponseIsSuccessful();
        
        $content = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertGreaterThanOrEqual(1, count($content));
        $this->assertSame('Tache Autre', $content[0]['nom']);
    }

    public function testAccesInterditAutreUtilisateur(): void
    {
        // 1. La victime crée une tâche
        [$victime, $tokenVictime] = $this->createAndLoginUser('aidant');
        
        $tache = new Tache('Tache Secrète', 'Desc', new \DateTime(), 1, $victime);
        $tache->setAidantAffecte($victime);
        $this->entityManager->persist($tache);
        $this->entityManager->flush();

        // 2. L'attaquant (un autre aidant) se connecte
        [$attaquant, $tokenAttaquant] = $this->createAndLoginUser('aidant');

        // 3. L'attaquant essaie de supprimer la tâche de la victime
        $this->client->request('DELETE', '/api/taches/' . $tache->getId(), [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenAttaquant
        ]);

        // 4. On vérifie qu'on reçoit bien une 403 Forbidden
        $this->assertResponseStatusCodeSame(403);
    }
}