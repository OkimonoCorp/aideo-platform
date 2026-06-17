<?php

namespace App\Tests\Controller;

use App\Entity\Adresse;
use App\Tests\ApiTestCase;

class ProfileControllerTest extends ApiTestCase
{
    public function testProfileRecuperation(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');
        
        // 2. Action : Récupération du profil
        $this->client->request('GET', '/api/profile', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérifications
        $this->assertResponseIsSuccessful();
        
        // Vérification du format JSON
        $content = $this->client->getResponse()->getContent();
        $this->assertJson($content);
        
        // Vérification du contenu (email correct)
        $data = json_decode($content, true);
        $this->assertArrayHasKey('email', $data);
        $this->assertSame($user->getEmail(), $data['email']);
    }

    public function testProfileModification(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. Action : Modification du nom
        $this->client->request('PUT', '/api/profile', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['nom' => 'Nouveau Nom']));

        // 3. Vérification : Code 204 (No Content)
        $this->assertEquals(204, $this->client->getResponse()->getStatusCode());
    }

    public function testProfileAdresseSuppression(): void
    {
        // 1. Préparation : Un PRO avec une adresse en base
        [$pro, $token] = $this->createAndLoginUser('pro');
        
        $adresse = new Adresse('10 Rue Test', $pro);
        $this->entityManager->persist($adresse);
        $this->entityManager->flush();

        // 2. Action : Suppression de l'adresse
        $this->client->request('DELETE', '/api/profile/adresses/' . $adresse->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérification : Code 204
        $this->assertEquals(204, $this->client->getResponse()->getStatusCode());
    }

    public function testProfileAdresseAjout(): void
    {
        // 1. Connexion d'un Professionnel
        [$pro, $token] = $this->createAndLoginUser('pro');

        // 2. Action : Ajout d'une nouvelle adresse
        $this->client->request('POST', '/api/profile/adresses', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['adresse' => 'Nouvelle Adresse']));

        // 3. Vérification : Code 204
        $this->assertEquals(204, $this->client->getResponse()->getStatusCode());
    }

    public function testGetTypeUtilisateur(): void
    {
        // --- Scénario A : Aidant ---
        [$aidant, $tokenAidant] = $this->createAndLoginUser('aidant');
        $this->client->request('GET', '/api/profile/type', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenAidant]);
        
        $this->assertResponseIsSuccessful();
        $json = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('aidant', $json['type']);

        // --- Scénario B : Professionnel ---
        [$pro, $tokenPro] = $this->createAndLoginUser('pro');
        $this->client->request('GET', '/api/profile/type', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenPro]);
        
        $json = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('professionnel', $json['type']);

        // --- Scénario C : Admin ---
        [$admin, $tokenAdmin] = $this->createAndLoginUser('admin');
        $this->client->request('GET', '/api/profile/type', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenAdmin]);
        
        $json = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('admin', $json['type']);
    }
}