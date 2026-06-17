<?php

namespace App\Tests\Controller;

use App\Entity\Message;
use App\Tests\ApiTestCase;

class MessageControllerTest extends ApiTestCase
{
    public function testSendMessage(): void
    {
        // 1. Création des utilisateurs
        [$user, $token] = $this->createAndLoginUser('aidant');
        [$destinataire, $t2] = $this->createAndLoginUser('aidant');

        // 2. Envoi du message
        $this->client->request('POST', '/api/messages', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode([
            'destinataireId' => $destinataire->getId(),
            'texte' => 'Test message'
        ]));
        
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function testDeleteMessage(): void
    {
        // 1. Création des utilisateurs
        [$user, $token] = $this->createAndLoginUser('aidant');
        [$destinataire, $t2] = $this->createAndLoginUser('aidant');

        // 2. Création préalable du message en base
        $message = new Message();
        $message->setAuteur($user);
        $message->setDestinataire($destinataire);
        $message->setTexte('To delete');
        $message->setDate(new \DateTime());
        $this->entityManager->persist($message);
        $this->entityManager->flush();

        // 3. Suppression
        $this->client->request('DELETE', '/api/messages/' . $message->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        $this->assertEquals(204, $this->client->getResponse()->getStatusCode());
    }

    public function testConversation(): void
    {
        // 1. Création des utilisateurs
        [$user, $token] = $this->createAndLoginUser('aidant');
        [$other, $t2] = $this->createAndLoginUser('aidant');

        // 2. Récupération de la conversation
        $this->client->request('GET', '/api/messages/conversation/' . $other->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        $this->assertResponseIsSuccessful();
    }

    public function testConversations(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. Récupération de la liste des conversations
        $this->client->request('GET', '/api/messages/conversations', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        $this->assertResponseIsSuccessful();
    }
}