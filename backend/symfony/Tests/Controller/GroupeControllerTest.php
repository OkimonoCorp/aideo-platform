<?php

namespace App\Tests\Controller;

use App\Entity\Groupe;
use App\Tests\ApiTestCase;

class GroupeControllerTest extends ApiTestCase
{
    public function testCreerGroupe(): void
    {
        // 1. On se connecte en tant qu'aidant
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. On envoie la requête de création avec le token
        $this->client->request('POST', '/api/groupes', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['nom' => 'Famille Test']));
        
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function testMesGroupes(): void
    {
        // 1. On se connecte
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. On récupère la liste des groupes
        $this->client->request('GET', '/api/groupes', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        $this->assertResponseIsSuccessful();
    }

    public function testDetailGroupe(): void
    {
        // 1. On se connecte
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. Création préalable d'un groupe en base pour le test
        $groupe = new Groupe();
        $groupe->setNom('Groupe Test');
        $groupe->addMembre($user);
        $this->entityManager->persist($groupe);
        $this->entityManager->flush();

        // 3. On demande le détail de ce groupe spécifique via son ID
        $this->client->request('GET', '/api/groupes/' . $groupe->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        $this->assertResponseIsSuccessful();
    }

    public function testAjouterMembre(): void
    {
        // 1. On connecte l'utilisateur A (créateur du groupe)
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. On crée un utilisateur B à inviter (pour avoir un email valide en base)
        [$userAInviter, $token2] = $this->createAndLoginUser('aidant'); 
        $emailInvite = $userAInviter->getEmail();

        // 3. On crée le groupe
        $groupe = new Groupe();
        $groupe->setNom('Groupe Invitation');
        $groupe->addMembre($user);
        $this->entityManager->persist($groupe);
        $this->entityManager->flush();

        // 4. On lance l'invitation
        $this->client->request('POST', '/api/groupes/ajouter-membre/' . $groupe->getId(), [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['email' => $emailInvite]));
        
        $this->assertResponseIsSuccessful();
    }

    public function testQuitterGroupe(): void
    {
        // 1. On se connecte
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. On crée un groupe dont l'utilisateur est membre
        $groupe = new Groupe();
        $groupe->setNom('Groupe Départ');
        $groupe->addMembre($user);
        $this->entityManager->persist($groupe);
        $this->entityManager->flush();

        // 3. On quitte le groupe
        $this->client->request('GET', '/api/groupes/quitter/' . $groupe->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        $this->assertResponseIsSuccessful();
    }
}