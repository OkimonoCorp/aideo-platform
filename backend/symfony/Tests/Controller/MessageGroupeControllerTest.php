<?php

namespace App\Tests\Controller;

use App\Entity\Groupe;
use App\Entity\Message;
use App\Tests\ApiTestCase;

class MessageGroupeControllerTest extends ApiTestCase
{
    public function testSendMessageGroupe(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. Création du groupe et ajout du membre
        $groupe = new Groupe();
        $groupe->setNom('Grp Msg');
        $groupe->addMembre($user);
        $this->entityManager->persist($groupe);
        $this->entityManager->flush();

        // 3. Envoi du message
        $this->client->request('POST', '/api/messages-groupe', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode([
            'groupeId' => $groupe->getId(),
            'texte' => 'Test message groupe'
        ]));
        
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function testConversationGroupe(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. Création groupe + membre
        $groupe = new Groupe();
        $groupe->setNom('Grp Msg');
        $groupe->addMembre($user);
        $this->entityManager->persist($groupe);
        $this->entityManager->flush();

        // 3. Récupération
        $this->client->request('GET', '/api/messages-groupe/groupe/' . $groupe->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        $this->assertResponseIsSuccessful();
    }

    public function testDeleteMessageGroupe(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. Création données
        $groupe = new Groupe();
        $groupe->setNom('Grp Msg');
        $groupe->addMembre($user);
        
        $message = new Message();
        $message->setAuteur($user);
        $message->setGroupe($groupe);
        $message->setTexte('To delete');
        $message->setDate(new \DateTime());

        $this->entityManager->persist($groupe);
        $this->entityManager->persist($message);
        $this->entityManager->flush();

        // 3. Suppression
        $this->client->request('DELETE', '/api/messages-groupe/' . $message->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        $this->assertEquals(204, $this->client->getResponse()->getStatusCode());
    }
}