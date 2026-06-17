<?php

namespace App\Tests;

use App\Entity\Admin;
use App\Entity\Aidant;
use App\Entity\Professionnel;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\ORM\EntityManagerInterface;

class ApiTestCase extends WebTestCase
{
    protected $client;
    protected EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = $this->client->getContainer()->get('doctrine')->getManager();
    }

    /**
     * Crée un utilisateur, le persiste et retourne son Token JWT
     */
    protected function createAndLoginUser(string $type = 'aidant'): array
    {
        $uniq = uniqid();
        $email = "test_{$type}_{$uniq}@test.com";

        if ($type === 'admin') {
            $user = new Admin($email, 'ADMIN', 'SuperAdmin');
            $user->setRoles(['ROLE_ADMIN']);
        } elseif ($type === 'pro') {
            $user = new Professionnel($email, 'Entreprise ' . $uniq, 'Contact', '0102030405');
            $user->setRoles(['ROLE_PRO']);
        } else {
            $user = new Aidant($email, 'Dupont', 'Jean', '0601020304', 'Adresse ' . $uniq);
            $user->setRoles(['ROLE_AIDANT']);
            $user->setPts(500); // On lui donne des points par défaut
        }

        // Hashage du mot de passe
        $hasher = $this->client->getContainer()->get('security.user_password_hasher');
        $user->setPassword($hasher->hashPassword($user, 'password123'));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Génération du Token via le service LexikJWT
        $jwtManager = $this->client->getContainer()->get('lexik_jwt_authentication.jwt_manager');
        $token = $jwtManager->create($user);
        return [$user, $token];
    }
    
    /**
     * Helper pour récupérer l'ID de l'utilisateur qu'on vient de créer
     */
    protected function getUserFromEmail(string $email) {
        return $this->entityManager->getRepository(\App\Entity\Utilisateur::class)->findOneBy(['email' => $email]);
    }
}