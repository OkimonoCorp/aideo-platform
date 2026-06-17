<?php

namespace App\Tests\Controller;

use App\Entity\Aidant;
use App\Entity\Avantage;
use App\Entity\Professionnel;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AchatAvantageTest extends WebTestCase
{
    public function testPeutAcheterDeuxFoisLeMemeAvantage()
    {
        $client = static::createClient();
        $container = $client->getContainer();
        $em = $client->getContainer()->get('doctrine')->getManager();

        // --- 1. PRÉPARATION (SETUP) ---

        // ASTUCE : On génère un ID unique pour éviter l'erreur "Email already exists"
        $uniqueId = uniqid(); 

        // A. Création du Pro avec email unique
        $emailPro = "pro_{$uniqueId}@test.com";
        $pro = new Professionnel($emailPro, 'Pro SARL', '0102030405');
        $pro->setPassword('password');
        $em->persist($pro);

        // B. Création de l'Avantage
        $avantage = new Avantage();
        $avantage->setNom('Place Cinéma');
        $avantage->setDescription('Une place gratuite');
        $avantage->setPrix(100);
        $avantage->setApprouve(true);
        $avantage->setLienQR('http://example.com/qr-code.png');
        $avantage->setProprietaire($pro);
        $em->persist($avantage);

        // C. Création de l'Aidant avec email unique
        $emailAidant = "acheteur_{$uniqueId}@test.com";
        $aidant = new Aidant($emailAidant, 'Dupont', 'Jean');
        $aidant->setPassword('password');
        $aidant->setPts(5000); 
        $em->persist($aidant);

        $em->flush();

        // --- 2. EXÉCUTION ---

        $jwtManager = $container->get('lexik_jwt_authentication.jwt_manager');
        $token = $jwtManager->create($aidant);

        // On configure le client pour qu'il envoie ce Token à CHAQUE requête
        $client->setServerParameter('HTTP_AUTHORIZATION', sprintf('Bearer %s', $token));

        $idAvantage = $avantage->getId();

        // PREMIER ACHAT
        $client->request('GET', '/api/avantages/reclamer/' . $idAvantage);
        $this->assertResponseIsSuccessful("Le 1er achat a échoué");

        // DEUXIÈME ACHAT
        $client->request('GET', '/api/avantages/reclamer/' . $idAvantage);
        $this->assertResponseIsSuccessful("Le 2ème achat a échoué");

        // --- 3. VÉRIFICATION ---
        
        $client->request('GET', '/api/avantages/mes-avantages');
        $this->assertResponseIsSuccessful();
        
        $content = json_decode($client->getResponse()->getContent(), true);
        
        $count = 0;
        foreach ($content as $item) {
            if ($item['id'] === $idAvantage) {
                $count++;
            }
        }

        $this->assertGreaterThanOrEqual(2, $count, "L'avantage devrait apparaître au moins 2 fois");
    }
}