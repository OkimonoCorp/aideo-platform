<?php

namespace App\DataFixtures;

use App\Entity\Admin;
use App\Entity\Adresse;
use App\Entity\Aidant;
use App\Entity\Avantage;
use App\Entity\Groupe;
use App\Entity\Message;
use App\Entity\Professionnel;
use App\Entity\Service;
use App\Entity\Tache;
use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    public function load(ObjectManager $manager): void
    {
        // ======================================================
        // 1. LES GROUPES
        // ======================================================
        $groupeDupont = new Groupe();
        $groupeDupont->setNom('Famille Dupont');
        $manager->persist($groupeDupont);


        // ======================================================
        // 2. LES UTILISATEURS
        // ======================================================

        // --- ADMIN ---
        $admin = new Admin('admin@test.com', 'ADMIN', 'SuperAdmin');
        $admin->setPassword($this->hasher->hashPassword($admin, '1'));
        $manager->persist($admin);

        // --- PRO (Michel) ---
        $michelPro = new Professionnel('michelpro@test.com', 'Amazon', 'Michel de la compta', '0746829745');
        $michelPro->setPassword($this->hasher->hashPassword($michelPro, '1'));

        // Ajout d'une adresse pour le pro
        $adressePro = new Adresse('15 avenue des Champs-Élysées, Paris', $michelPro);
        $manager->persist($adressePro);
        $michelPro->addAdress($adressePro);

        $manager->persist($michelPro);

        // --- AIDANT 1 : JEAN (Chef de famille) ---
        $jean = new Aidant('jean@test.com', 'Dupont', 'Jean', '0601020304', '10 rue de Paris');
        $jean->setPassword($this->hasher->hashPassword($jean, '1'));
        $jean->setPts(500);
        $jean->addGroupe($groupeDupont);
        $manager->persist($jean);

        // --- AIDANT 2 : CLAUDE (Membre riche en points) ---
        $claude = new Aidant('claude@test.com', 'Francois', 'Claude', '0699999999', '20 boulevard du succès');
        $claude->setPassword($this->hasher->hashPassword($claude, '1'));
        $claude->setPts(10000); // Pour tester l'achat d'avantages
        $claude->addGroupe($groupeDupont);
        $manager->persist($claude);

        // --- AIDANT 3 : MARIE (Pour tester les "autres membres") ---
        $marie = new Aidant('marie@test.com', 'Dupont', 'Marie', '0655555555', '10 rue de Paris');
        $marie->setPassword($this->hasher->hashPassword($marie, '1'));
        $marie->setPts(100);
        $marie->addGroupe($groupeDupont);
        $manager->persist($marie);


        // ======================================================
        // 3. LES TÂCHES (Pour tester le tri et l'appartenance)
        // ======================================================

        // Tâche pour Jean
        $tacheJean = new Tache(
            'Sortir les poubelles',
            'Poubelle jaune ce soir',
            new \DateTime('2026-01-10 19:00:00'),
            0.5,
            $jean
        );
        $tacheJean->setAidantAffecte($jean);
        $manager->persist($tacheJean);

        // Tâche pour Claude
        $tacheClaude = new Tache(
            'Réparer l\'évier',
            'Il fuit depuis 3 jours',
            new \DateTime('2026-01-12 10:00:00'),
            2.5,
            $claude
        );
        $tacheClaude->setAidantAffecte($claude);
        $manager->persist($tacheClaude);

        // Tâche pour Marie
        $tacheMarie = new Tache(
            'Faire les courses',
            'Lait, Pain, Beurre',
            new \DateTime('2026-01-13 14:00:00'),
            1.5,
            $marie
        );
        $tacheMarie->setAidantAffecte($marie);
        $manager->persist($tacheMarie);


        // ======================================================
        // 4. LES SERVICES (Géolocalisation)
        // ======================================================

        // Service lié à la tâche de Jean (Proposition)
        $serviceJean = new Service(
            $tacheJean,
            5,          // Max demandeurs
            48.8566,    // Latitude (Paris Centre)
            2.3522,     // Longitude
            $jean,
            "proposition"
        );
        $manager->persist($serviceJean);

        // Service lié à la tâche de Claude (Demande)
        $serviceClaude = new Service(
            $tacheClaude,
            10,       // Pas de limite pour une demande
            48.7894,    // Latitude (Sud Paris)
            2.3838,     // Longitude
            $claude,
            "demande"
        );
        $manager->persist($serviceClaude);


        // ======================================================
        // 5. LES MESSAGES (Privés & Groupe)
        // ======================================================

        // -- Conversation Privée : Jean <-> Marie --
        $msg1 = new Message();
        $msg1->setAuteur($jean)->setDestinataire($marie)
             ->setTexte("Salut Marie, tu penses aux courses ?")
             ->setDate(new \DateTime('-2 hours'));
        $manager->persist($msg1);

        $msg2 = new Message();
        $msg2->setAuteur($marie)->setDestinataire($jean)
             ->setTexte("Oui t'inquiète, j'y vais après le boulot.")
             ->setDate(new \DateTime('-1 hour'));
        $manager->persist($msg2);

        // -- Conversation de Groupe : Famille Dupont --
        $msgGrp1 = new Message();
        $msgGrp1->setAuteur($jean)->setGroupe($groupeDupont)
                ->setTexte("Bienvenue tout le monde dans le groupe familial !")
                ->setDate(new \DateTime('-1 day'));
        $manager->persist($msgGrp1);

        $msgGrp2 = new Message();
        $msgGrp2->setAuteur($claude)->setGroupe($groupeDupont)
                ->setTexte("Hello ! Super initiative.")
                ->setDate(new \DateTime('-20 hours'));
        $manager->persist($msgGrp2);


        // ======================================================
        // 6. LES AVANTAGES (Loyauté)
        // ======================================================

        $avantage = new Avantage();
        $avantage->setNom('Bon d\'achat 10€');
        $avantage->setDescription('Valable sur tout le magasin Amazon');
        $avantage->setPrix(500); // Jean peut l'acheter (il a 500), Claude aussi
        $avantage->setLienQR('https://qrcode.com/code123');
        $avantage->setProprietaire($michelPro);
        $avantage->setApprouve(true); // Directement validé pour tester
        $manager->persist($avantage);


        // ======================================================
        // 7. SAUVEGARDE FINALE
        // ======================================================
        $manager->flush();
    }
}
