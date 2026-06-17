<?php

namespace App\Tests\Controller;

use App\Tests\ApiTestCase;
use App\Entity\AchatAvantage;


class AcountControllerTest extends ApiTestCase
{
    public function testCreerCompteAidant(): void
    {
        // 1. Envoi de la requête d'inscription (Route publique)
        $this->client->request('POST', '/api/creer_compte', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'type' => 'aidant',
            'email' => 'new_aidant_'.uniqid().'@test.com',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'password' => 'password123',
            'telephone' => '0123456789',
            'adresse' => '123 Rue Test'
        ]));
        
        // 2. Vérification de la réponse
        $this->assertResponseIsSuccessful();
        
        $responseContent = $this->client->getResponse()->getContent();
        $this->assertJson($responseContent);
        $data = json_decode($responseContent, true);
        
        $this->assertSame('Compte créé avec succès', $data['status']);
    }

    public function testCreerCompteProfessionnel(): void
    {
        // 1. Envoi de la requête d'inscription PRO
        $this->client->request('POST', '/api/creer_compte', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'type' => 'professionnel',
            'email' => 'new_pro_'.uniqid().'@test.com',
            'nom' => 'Entreprise Test',
            'nomContact' => 'Monsieur Contact',
            'password' => 'password123',
            'telephone' => '0123456789',
            'adresses' => ['10 Rue Pro', '20 Rue Annexe']
        ]));

        // 2. Vérification du statut 201 (Created)
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
        
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Compte pro créé avec succès', $data['status']);
    }

    public function testModifPassword(): void
    {
        // 1. Connexion (Authentification)
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. Envoi de la demande de modification
        $this->client->request('POST', '/api/password_modif', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode([
            'old_password' => 'password123',
            'new_password' => 'NewStrongPassword456!'
        ]));

        // 3. Vérification de la réussite
        $this->assertResponseIsSuccessful();
        
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Mot de passe modifié avec succès', $data['status']);
    }

    public function testSupprimerCompte(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('aidant');

        // 2. Envoi de la demande de suppression (avec confirmation mot de passe)
        $this->client->request('POST', '/api/supprimer_compte', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode([
            'password' => 'password123' 
        ]));

        // 3. Vérification de la réussite
        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Compte supprimé avec succès', $data['status']);
    }

    public function testSupprimerCompteProRembourseAidants(): void
    {
        // 1. Préparation des acteurs (1 Pro + 1 Aidant)
        [$pro, $tokenPro] = $this->createAndLoginUser('pro');
        
        [$aidant, $tokenAidant] = $this->createAndLoginUser('aidant');
        $aidant->setPts(0); // On force les points à 0 pour le test
        $this->entityManager->flush();

        // 2. Mise en place de la situation (Pro crée avantage, Aidant le possède)
        $avantage = new \App\Entity\Avantage();
        $avantage->setNom('Massage');
        $avantage->setDescription('Desc');
        $avantage->setLienQR('qr');
        $avantage->setPrix(100);
        $avantage->setProprietaire($pro);
        $avantage->setApprouve(true);
        
        $this->entityManager->persist($avantage);
        $this->entityManager->flush();

        // Simulation de l'achat : on lie l'aidant à l'avantage
        $achat = new AchatAvantage();
        $achat->setAidant($aidant);
        $achat->setAvantage($avantage);
        $this->entityManager->persist($achat);
        $this->entityManager->flush();

        // 3. Action : Le Pro supprime son compte
        $this->client->request('POST', '/api/supprimer_compte', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenPro
        ], json_encode(['password' => 'password123']));

        $this->assertResponseIsSuccessful();

        // 4. Vérification métier : Remboursement des points
        // L'aidant doit avoir récupéré les 100 points de l'avantage supprimé
        $this->entityManager->clear();
        $aidantRafraichi = $this->entityManager->getRepository(\App\Entity\Aidant::class)->find($aidant->getId());
        $this->assertEquals(100, $aidantRafraichi->getPts());
    }
}