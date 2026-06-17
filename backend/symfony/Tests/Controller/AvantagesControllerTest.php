<?php

namespace App\Tests\Controller;

use App\Entity\Avantage;
use App\Tests\ApiTestCase;

class AvantagesControllerTest extends ApiTestCase
{
    public function testCreationEtFlowAvantage(): void
    {
        // 1. Étape PRO : Création de l'avantage
        [$pro, $tokenPro] = $this->createAndLoginUser('pro');

        $this->client->request('POST', '/api/avantages', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenPro
        ], json_encode([
            'nom' => 'Promo Test',
            'description' => 'Desc',
            'prix' => 10,
            'lienQR' => 'qr_code_unique'
        ]));
        
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
        
        // Récupération de l'ID pour la suite du test
        $response = json_decode($this->client->getResponse()->getContent(), true);
        $avantageId = $response['id'];

        // 2. Étape ADMIN : Approbation de l'avantage
        [$admin, $tokenAdmin] = $this->createAndLoginUser('admin');
        
        $this->client->request('POST', '/api/avantages/approuver/' . $avantageId, [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenAdmin
        ]);
        $this->assertResponseIsSuccessful();

        // 3. Étape AIDANT : Réclamation de l'avantage
        [$aidant, $tokenAidant] = $this->createAndLoginUser('aidant');
        
        $this->client->request('GET', '/api/avantages/reclamer/' . $avantageId, [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenAidant
        ]);
        $this->assertResponseIsSuccessful();

        // 4. Étape PRO : Révocation (l'aidant a utilisé son code)
        // Note : On utilise le token du Pro récupéré à l'étape 1
        $this->client->request('POST', '/api/avantages/revoquer/' . $avantageId, [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenPro
        ], json_encode(['aidantId' => $aidant->getId()]));

        $this->assertResponseIsSuccessful();
    }

    public function testListeAvantages(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. Action : Récupérer la liste
        $this->client->request('GET', '/api/avantages', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testDetailAvantage(): void
    {
        // 1. Préparation : Un Pro insère un avantage en base
        [$pro, $tokenPro] = $this->createAndLoginUser('pro');
        
        $avantage = new Avantage();
        $avantage->setNom('Test Detail');
        $avantage->setDescription('Une super description obligatoire !');
        $avantage->setLienQR('https://qr.com/code123');
        $avantage->setProprietaire($pro);
        $avantage->setPrix(10);
        $avantage->setApprouve(true);
        
        $this->entityManager->persist($avantage);
        $this->entityManager->flush();

        // 2. Action : Un Aidant consulte le détail
        [$user, $token] = $this->createAndLoginUser('aidant');
        $this->client->request('GET', '/api/avantages/' . $avantage->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testModificationAvantage(): void
    {
        // 1. Préparation : Création de l'avantage par le Pro
        [$pro, $tokenPro] = $this->createAndLoginUser('pro');
        
        $avantage = new Avantage();
        $avantage->setNom('Avant Modif');
        $avantage->setDescription('Description obligatoire');
        $avantage->setLienQR('https://qr.com/modif');
        $avantage->setProprietaire($pro);
        $avantage->setPrix(10);
        $avantage->setApprouve(false);
        
        $this->entityManager->persist($avantage);
        $this->entityManager->flush();

        // 2. Action : Le Pro modifie son avantage
        $this->client->request('PUT', '/api/avantages/' . $avantage->getId(), [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenPro
        ], json_encode(['nom' => 'Après Modif']));

        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testSuppressionAvantage(): void
    {
        // 1. Préparation : Création de l'avantage
        [$pro, $tokenPro] = $this->createAndLoginUser('pro');
        
        $avantage = new Avantage();
        $avantage->setNom('A supprimer');
        $avantage->setDescription('Description obligatoire');
        $avantage->setLienQR('https://qr.com/delete');
        $avantage->setProprietaire($pro);
        $avantage->setPrix(10);
        $avantage->setApprouve(false);
        
        $this->entityManager->persist($avantage);
        $this->entityManager->flush();

        // 2. Action : Suppression
        $this->client->request('DELETE', '/api/avantages/' . $avantage->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenPro]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testMesAvantages(): void
    {
        // 1. Connexion Aidant
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. Action : Voir ses avantages acquis
        $this->client->request('GET', '/api/avantages/mes-avantages', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testListeAvantagesApprouves(): void
    {
        // 1. Connexion Aidant
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. Action : Voir la liste publique des avantages validés
        $this->client->request('GET', '/api/avantages/approuves', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }

    public function testRefuserAvantage(): void
    {
        // 1. Préparation : Un admin et un pro (propriétaire)
        [$admin, $tokenAdmin] = $this->createAndLoginUser('admin');
        [$pro, $t] = $this->createAndLoginUser('pro');
        
        $avantage = new Avantage();
        $avantage->setNom('A refuser');
        $avantage->setDescription('Description obligatoire');
        $avantage->setLienQR('https://qr.com/refuser');
        $avantage->setProprietaire($pro);
        $avantage->setPrix(10);
        $avantage->setApprouve(false);
        
        $this->entityManager->persist($avantage);
        $this->entityManager->flush();

        // 2. Action : L'admin refuse l'avantage
        $this->client->request('POST', '/api/avantages/refuser/' . $avantage->getId(), [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenAdmin]);
        
        // 3. Vérification
        $this->assertResponseIsSuccessful();
    }
}