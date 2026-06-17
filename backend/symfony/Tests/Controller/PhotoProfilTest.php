<?php

namespace App\Tests\Controller;

use App\Tests\ApiTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PhotoProfilTest extends ApiTestCase
{
    // Signature binaire minimale d'un PNG valide (nécessaire pour les tests MimeType)
    private const TINY_PNG = "\x89PNG\r\n\x1a\n\x00\x00\x00\x0dIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0aIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\x0d\x0a\x2d\xb4\x00\x00\x00\x00IEND\xae\x42\x60\x82";


    // TESTS POST (UPLOAD)
    public function testUploadPhotoSucces(): void
    {
        // 1. Préparation : Création d'un fichier temporaire valide (Vrai binaire PNG)
        [$user, $token] = $this->createAndLoginUser('utilisateur');
        
        $cheminFichier = tempnam(sys_get_temp_dir(), 'test_img');
        file_put_contents($cheminFichier, self::TINY_PNG);

        $fichier = new UploadedFile($cheminFichier, 'avatar.png', 'image/png', null, true);

        // 2. Action : Upload du fichier
        $this->client->request('POST', '/api/profile/photo_profil', [], ['photo' => $fichier], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);

        // 3. Vérification : Base de données mise à jour
        $this->assertResponseIsSuccessful();
        
        $this->entityManager->clear(); // On vide le cache pour relire la BDD
        $userUpdated = $this->entityManager->getRepository(\App\Entity\Utilisateur::class)->find($user->getId());
        
        $this->assertNotNull($userUpdated->getPhotoProfil());
        $this->assertEquals('image/png', $userUpdated->getPhotoProfilMime());
        $this->assertEquals(base64_encode(self::TINY_PNG), $userUpdated->getPhotoProfil());

        @unlink($cheminFichier); // Nettoyage
    }

    public function testUploadFichierManquant(): void
    {
        // 1. Connexion
        [$user, $token] = $this->createAndLoginUser('utilisateur');

        // 2. Action : Envoi sans fichier
        $this->client->request('POST', '/api/profile/photo_profil', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);

        // 3. Vérification : Erreur 400
        $this->assertResponseStatusCodeSame(400);
    }

    public function testUploadMauvaisTypeMime(): void
    {
        // 1. Préparation : Fichier texte déguisé en PDF
        [$user, $token] = $this->createAndLoginUser('utilisateur');

        $cheminFichier = tempnam(sys_get_temp_dir(), 'test_txt');
        file_put_contents($cheminFichier, 'Ceci est un texte simple');

        $fichier = new UploadedFile($cheminFichier, 'doc.pdf', 'application/pdf', null, true);

        // 2. Action : Upload
        $this->client->request('POST', '/api/profile/photo_profil', [], ['photo' => $fichier], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);

        // 3. Vérification : Erreur 415 (Type non supporté)
        $this->assertResponseStatusCodeSame(415);
        
        @unlink($cheminFichier);
    }

    public function testUploadFichierTropGros(): void
    {
        // 1. Préparation : Création d'un fichier valide mais > 2Mo
        [$user, $token] = $this->createAndLoginUser('utilisateur');

        $cheminFichier = tempnam(sys_get_temp_dir(), 'test_big');
        $contenu = self::TINY_PNG . str_repeat('a', 2000001); // Header PNG + Déchets
        file_put_contents($cheminFichier, $contenu);

        $fichier = new UploadedFile($cheminFichier, 'big.png', 'image/png', null, true);

        // 2. Action : Upload
        $this->client->request('POST', '/api/profile/photo_profil', [], ['photo' => $fichier], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);

        // 3. Vérification : Erreur 413 (Payload Too Large)
        $this->assertResponseStatusCodeSame(413);

        @unlink($cheminFichier);
    }

    // TESTS GET (RECUPERATION)
    public function testGetMaPhotoProfil(): void
    {
        // 1. Préparation : Injection manuelle de la photo en BDD
        [$user, $token] = $this->createAndLoginUser('utilisateur');

        $user->setPhotoProfil(base64_encode(self::TINY_PNG));
        $user->setPhotoProfilMime('image/png');
        $this->entityManager->flush();

        // 2. Action : Récupération de ma photo
        $this->client->request('GET', '/api/profile/photo_profil', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);

        // 3. Vérification : Contenu binaire et Headers
        $this->assertResponseIsSuccessful();
        $this->assertEquals(self::TINY_PNG, $this->client->getResponse()->getContent());
        $this->assertTrue($this->client->getResponse()->headers->contains('Content-Type', 'image/png'));
    }

    public function testGetMaPhotoProfilInexistante(): void
    {
        // 1. Connexion (sans photo)
        [$user, $token] = $this->createAndLoginUser('utilisateur');
        
        // 2. Action : GET
        $this->client->request('GET', '/api/profile/photo_profil', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
        ]);

        // 3. Vérification : 204
        $this->assertResponseStatusCodeSame(204);
    }

    public function testGetPhotoPublique(): void
    {
        // 1. Préparation : Un utilisateur cible avec photo
        [$cible, $tokenCible] = $this->createAndLoginUser('utilisateur');
        $cible->setPhotoProfil(base64_encode(self::TINY_PNG));
        $cible->setPhotoProfilMime('image/png');
        $this->entityManager->flush();

        // 2. Action : Un visiteur demande la photo
        [$visiteur, $tokenVisiteur] = $this->createAndLoginUser('utilisateur');

        $this->client->request('GET', '/api/profile/photo_profil/' . $cible->getId(), [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenVisiteur
        ]);

        // 3. Vérification
        $this->assertResponseIsSuccessful();
        $this->assertEquals(self::TINY_PNG, $this->client->getResponse()->getContent());
        $this->assertTrue($this->client->getResponse()->headers->contains('Content-Type', 'image/png'));
    }

    public function testGetPhotoPubliqueInconnue(): void
    {
        // 1. Connexion visiteur
        [$visiteur, $tokenVisiteur] = $this->createAndLoginUser('utilisateur');

        // 2. Action : Demande d'un ID inexistant
        $this->client->request('GET', '/api/profile/photo_profil/999999', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $tokenVisiteur
        ]);

        // 3. Vérification : 204
        $this->assertResponseStatusCodeSame(204);
    }
}