<?php

namespace App\Tests\Controller;

use App\Entity\Aidant;
use App\Entity\Service;
use App\Entity\Tache;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ServiceValidationTest extends WebTestCase
{
    private $client;
    private $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
    }

    public function testValidationDemandeParCreateur()
    {
        // 1. On récupère ou crée les utilisateurs (Nettoyage automatique)
        $createur = $this->createAidant('createur@test.com', 'Createur', 0);
        $candidat = $this->createAidant('worker@test.com', 'Worker', 10);

        $tache = new Tache("Tonte", "Tondre pelouse", new \DateTime('+1 day'), 60, null);
        
        $service = new Service($tache, 1, 0.0, 0.0, $createur, 'demande');
        $service->addCandidat($candidat);

        // On ne persiste que les nouveaux objets (Tache et Service)
        // Les utilisateurs sont déjà gérés par createAidant
        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();
        
        $serviceId = $service->getId();

        // 2. Action
        $this->client->loginUser($createur);

        $this->client->request(
            'POST',
            '/api/services/' . $serviceId . '/validation',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['candidat_id' => $candidat->getId()])
        );

        // 3. Vérifications
        $this->assertResponseIsSuccessful();
        
        $this->entityManager->clear(); 
        $candidatUpdated = $this->entityManager->getRepository(Aidant::class)->find($candidat->getId());
        $tacheUpdated = $this->entityManager->getRepository(Tache::class)->find($tache->getId());

        $this->assertEquals(120, $candidatUpdated->getPts());
        $this->assertTrue($tacheUpdated->isFaite());
        $this->assertEquals($candidat->getId(), $tacheUpdated->getAidantAffecte()->getId());
    }

    public function testValidationPropositionParCandidat()
    {
        // 1. Préparation
        $prof = $this->createAidant('prof@test.com', 'Prof', 0);
        $eleve = $this->createAidant('eleve@test.com', 'Eleve', 0);

        $tache = new Tache("Maths", "Cours", new \DateTime('+1 day'), 30, null);
        
        $service = new Service($tache, 1, 0.0, 0.0, $prof, 'proposition');
        $service->addCandidat($eleve);

        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();
        $serviceId = $service->getId();

        // 2. Action
        $this->client->loginUser($eleve);

        $this->client->request('POST', '/api/services/' . $serviceId . '/validation');

        // 3. Vérifications
        $this->assertResponseIsSuccessful();

        $this->entityManager->clear();
        $profUpdated = $this->entityManager->getRepository(Aidant::class)->find($prof->getId());
        
        // 0 + 50 (base) + 30 (durée) = 80
        $this->assertEquals(80, $profUpdated->getPts());
    }

    public function testValidationInterdite()
    {
        $owner = $this->createAidant('owner@test.com', 'Owner', 0);
        $hacker = $this->createAidant('hacker@test.com', 'Hacker', 0);

        $tache = new Tache("Test", "Desc", new \DateTime('+1 day'), 60, null);
        $service = new Service($tache, 1, 0, 0, $owner, 'demande');
        
        $this->entityManager->persist($tache);
        $this->entityManager->persist($service);
        $this->entityManager->flush();

        $this->client->loginUser($hacker);

        $this->client->request('POST', '/api/services/' . $service->getId() . '/validation');

        $this->assertResponseStatusCodeSame(403);
    }

    // --- CORRECTION MAJEURE ICI ---
    /**
     * Crée un aidant s'il n'existe pas, ou le récupère et le réinitialise s'il existe déjà.
     */
    private function createAidant($email, $nom, $points)
    {
        $repo = $this->entityManager->getRepository(Aidant::class);
        
        // 1. On cherche si l'utilisateur existe déjà
        /** @var Aidant $existingUser */
        $existingUser = $repo->findOneBy(['email' => $email]);

        if ($existingUser) {
            // S'il existe, on le réinitialise (pour que le test parte de zéro)
            $existingUser->setPts($points);
            // On peut aussi reset le password si besoin
            $this->entityManager->flush();
            return $existingUser;
        }

        // 2. S'il n'existe pas, on le crée
        $aidant = new Aidant($email, $nom, 'Prenom', '0600000000', 'Adresse');
        $aidant->setPassword('password'); 
        $aidant->setPts($points);
        
        $this->entityManager->persist($aidant);
        $this->entityManager->flush();

        return $aidant;
    }
}