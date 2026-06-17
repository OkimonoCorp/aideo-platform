<?php

namespace App\Tests\Controller;

use App\Entity\Adresse;
use App\Tests\ApiTestCase;

class AdresseControllerTest extends ApiTestCase
{
    public function testProfileAdresseModification(): void
    {
        // 1. Préparation : Un PRO avec une adresse en base
        [$pro, $token] = $this->createAndLoginUser('pro');

        $adresse = new Adresse('10 Rue Test', $pro);
        $this->entityManager->persist($adresse);
        $this->entityManager->flush();

        // 2. Action : Modification de l'adresse
        $this->client->request('PUT', '/api/profile/adresses/' . $adresse->getId(), [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ], json_encode(['adresse' => 'Nouvelle Adresse Modifiée']));

        // 3. Vérification : Code 204
        $this->assertEquals(204, $this->client->getResponse()->getStatusCode());

        // 4. Vérification en base que l'adresse a été modifiée
        $this->entityManager->refresh($adresse);
        $this->assertEquals('Nouvelle Adresse Modifiée', $adresse->getAdresse());
    }
}