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
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface; // Important pour le groupe
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class DemoFixtures extends Fixture implements FixtureGroupInterface
{
    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    // Cette méthode permet d'utiliser : php bin/console doctrine:fixtures:load --group=demo
    public static function getGroups(): array
    {
        return ['demo'];
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');
        
        $allAidants = [];
        $allGroupes = [];

        // ======================================================
        // 1. ADMINISTRATEUR
        // ======================================================
        $admin = new Admin('admin@demo.com', 'ADMIN', 'SuperAdmin');
        $admin->setPassword($this->hasher->hashPassword($admin, 'demo123'));
        $manager->persist($admin);

        // ======================================================
        // 2. PROFESSIONNELS
        // ======================================================
        
        // PRO 1 : Resto
        $restoPro = new Professionnel('contact@leresto.com', 'Le Bon Restaurant', 'Marie Dubois', '0123456789');
        $restoPro->setPassword($this->hasher->hashPassword($restoPro, 'demo123'));
        $restoPro->setDescriptionEntr('Restaurant familial proposant des plats traditionnels français.');
        $manager->persist($restoPro);

        // PRO 2 : Coiffure
        $coiffurePro = new Professionnel('info@coiffureplus.com', 'Coiffure Plus', 'Pierre Martin', '0234567890');
        $coiffurePro->setPassword($this->hasher->hashPassword($coiffurePro, 'demo123'));
        $coiffurePro->setDescriptionEntr('Salon de coiffure moderne.');
        $manager->persist($coiffurePro);

        // PRO 3 : Garage
        $garagePro = new Professionnel('service@garageauto.com', 'Garage Auto Plus', 'Jean Dupont', '0345678901');
        $garagePro->setPassword($this->hasher->hashPassword($garagePro, 'demo123'));
        $garagePro->setDescriptionEntr('Garage spécialisé réparation.');
        $manager->persist($garagePro);

        // Ajout des adresses
        $adressesData = [
            [$restoPro, '15 Rue de la Paix, Paris 75001'],
            [$restoPro, '25 Avenue des Champs-Élysées, Paris 75008'],
            [$coiffurePro, '8 Boulevard Saint-Michel, Paris 75005'],
            [$garagePro, '45 Rue du Faubourg Saint-Antoine, Paris 75011']
        ];

        foreach ($adressesData as [$pro, $rue]) {
            $ad = new Adresse($rue, $pro);
            $pro->addAdress($ad);
            $manager->persist($ad);
        }

        // ======================================================
        // 3. AIDANTS (Fixes + Aléatoires)
        // ======================================================

        // --- A. Les Aidants "VIP" (Comptes fixes pour tests) ---
        $vipAidants = [
            ['sophie@demo.com', 'Leroy', 'Sophie', 'SophieAidante', 1500],
            ['marc@demo.com', 'Bernard', 'Marc', 'MarcLeBricoleur', 800],
            ['emma@demo.com', 'Petit', 'Emma', 'EmmaCuisine', 2000],
            ['lucas@demo.com', 'Moreau', 'Lucas', 'LucasJardin', 600],
        ];

        // Variables pour garder une référence aux VIP
        $sophie = null; $marc = null; $emma = null; $lucas = null;

        foreach ($vipAidants as [$email, $nom, $prenom, $pseudo, $pts]) {
            $aidant = new Aidant($email, $nom, $prenom, $faker->phoneNumber(), 'Paris');
            $aidant->setPassword($this->hasher->hashPassword($aidant, 'demo123'));
            $aidant->setPts($pts);
            $aidant->setPseudo($pseudo);
            $manager->persist($aidant);
            $allAidants[] = $aidant;
            
            if ($prenom === 'Sophie') $sophie = $aidant;
            if ($prenom === 'Marc') $marc = $aidant;
            if ($prenom === 'Emma') $emma = $aidant;
            if ($prenom === 'Lucas') $lucas = $aidant;
        }

        // --- B. Génération de 25 Aidants supplémentaires ---
        for ($i = 0; $i < 25; $i++) {
            $aidant = new Aidant(
                $faker->unique()->email(),
                $faker->lastName(),
                $faker->firstName(),
                $faker->phoneNumber(),
                $faker->address()
            );
            $aidant->setPassword($this->hasher->hashPassword($aidant, 'demo123'));
            $aidant->setPts($faker->numberBetween(0, 3000));
            $aidant->setPseudo($faker->unique()->userName());
            
            $manager->persist($aidant);
            $allAidants[] = $aidant;
        }

        // ======================================================
        // 4. GROUPES
        // ======================================================
        
        // Groupes fixes
        $groupeVoisins = new Groupe();
        $groupeVoisins->setNom('Voisins Solidaires');
        if($sophie) $sophie->addGroupe($groupeVoisins);
        if($marc) $marc->addGroupe($groupeVoisins);
        $manager->persist($groupeVoisins);
        $allGroupes[] = $groupeVoisins;

        $groupeFamille = new Groupe();
        $groupeFamille->setNom('Famille Moreau');
        if($emma) $emma->addGroupe($groupeFamille);
        if($lucas) $lucas->addGroupe($groupeFamille);
        $manager->persist($groupeFamille);
        $allGroupes[] = $groupeFamille;

        // Groupes aléatoires
        $nomsGroupes = ['Amis des animaux', 'Jogging Dimanche', 'Jeux de société', 'Jardinage Urbain', 'Entraide 75012'];
        foreach ($nomsGroupes as $nom) {
            $groupe = new Groupe();
            $groupe->setNom($nom);
            
            $membresAleatoires = $faker->randomElements($allAidants, $faker->numberBetween(3, 8));
            foreach ($membresAleatoires as $membre) {
                $membre->addGroupe($groupe);
            }
            $manager->persist($groupe);
            $allGroupes[] = $groupe;
        }

        // ======================================================
        // 5. AVANTAGES
        // ======================================================
        $avantagesData = [
            ['Repas offert', $restoPro, 50.0],
            ['Coupe gratuite', $coiffurePro, 30.0],
            ['Vidange offerte', $garagePro, 40.0]
        ];

        foreach ($avantagesData as [$nom, $pro, $prix]) {
            $av = new Avantage();
            $av->setNom($nom);
            $av->setDescription($faker->sentence());
            $av->setLienQr('https://demo.com/qr/' . uniqid());
            $av->setPrix($prix);
            $av->setApprouve(true);
            $av->setProprietaire($pro);
            $manager->persist($av);
        }

        // ======================================================
        // 6. TÂCHES ET SERVICES
        // ======================================================
        $typesService = ['demande', 'proposition'];

        // Dictionnaire de tâches réalistes par catégorie
        $detailsTaches = [
            'Bricolage' => [
                'Monter une étagère IKEA',
                'Réparer une fuite d\'eau sous évier',
                'Poser des tringles à rideaux',
                'Repeindre un mur de chambre',
                'Changer une prise électrique',
                'Poncer un vieux meuble'
            ],
            'Courses' => [
                'Aller chercher des médicaments à la pharmacie',
                'Faire les courses de la semaine (lourd)',
                'Récupérer un colis à la poste',
                'Acheter des fournitures scolaires',
                'Livraison de pain frais le matin'
            ],
            'Informatique' => [
                'Nettoyer un PC lent',
                'Installer une imprimante Wifi',
                'Cours de base sur Excel',
                'Récupérer des photos effacées',
                'Configurer une boite mail sur smartphone',
                'Conseil pour achat ordinateur'
            ],
            'Ménage' => [
                'Grand nettoyage de printemps',
                'Laver les vitres (3 fenêtres)',
                'Repassage de chemises',
                'Nettoyage après déménagement',
                'Aide au tri de vêtements'
            ],
            'Déménagement' => [
                'Porter des cartons (3ème étage sans ascenseur)',
                'Aide pour charger le camion',
                'Démonter une armoire normande',
                'Emballer la vaisselle fragile',
                'Conduire une camionnette'
            ],
            'Cuisine' => [
                'Préparer un gâteau d\'anniversaire',
                'Cours de cuisine italienne',
                'Batch cooking pour la semaine',
                'Préparer un repas végétarien',
                'Aide pour éplucher les légumes (grand repas)'
            ],
            'Garde animaux' => [
                'Promener un chien (Labrador) 1h',
                'Nourrir le chat pendant le weekend',
                'Garder un lapin nain',
                'Visite à domicile pour chat',
                'Emmener le chien chez le véto'
            ],
            'Cours de langue' => [
                'Conversation en Anglais',
                'Soutien scolaire Espagnol',
                'Cours de Français (FLE)',
                'Initiation au Japonais',
                'Aide aux devoirs Allemand'
            ]
        ];

        // On extrait les clés (les catégories) pour pouvoir en choisir une au hasard
        $categories = array_keys($detailsTaches);

        for ($i = 0; $i < 40; $i++) {
            $createur = $faker->randomElement($allAidants);
            $type = $faker->randomElement($typesService);
            
            // Paris et alentours
            $lat = 48.85 + $faker->randomFloat(4, -0.08, 0.08);
            $lon = 2.35 + $faker->randomFloat(4, -0.08, 0.08);
            
            // Durée (30, 60, 90 ou 120 min)
            $duree = $faker->randomElement([30, 60, 90, 120]);

            // 1. Choix de la catégorie et du titre
            $categorieChoisie = $faker->randomElement($categories);
            $titreConcret = $faker->randomElement($detailsTaches[$categorieChoisie]);

            // 2. Génération de la date avec HORAIRE CONTRÔLÉ
            // On prend une date au hasard
            $date = $faker->dateTimeBetween('-1 month', '+2 months');
            
            // IMPORTANT : On force l'heure entre 08h00 et 18h00
            // pour être sûr que ça ne déborde pas la nuit ou le lendemain
            $date->setTime(
                $faker->numberBetween(8, 18),   // Heure (8h à 18h)
                $faker->randomElement([0, 15, 30, 45]) // Minutes (00, 15, 30, 45)
            );

            // Préfixe visuel
            $prefixe = ($type === 'demande') ? 'Besoin : ' : 'Offre : ';
            
            $tache = new Tache(
                $prefixe . $titreConcret,
                $faker->realText(150),
                $date, // On utilise la date avec l'heure corrigée
                (float)$duree,
                null
            );

            $maxDemandeurs = ($type === 'proposition') ? $faker->numberBetween(2, 6) : 1;

            $service = new Service(
                $tache,
                $maxDemandeurs,
                $lat,
                $lon,
                $createur,
                $type
            );

            // Inscriptions
            $nbCandidats = $faker->numberBetween(0, 3);
            for ($j = 0; $j < $nbCandidats; $j++) {
                $candidat = $faker->randomElement($allAidants);
                if ($candidat !== $createur && !$service->getCandidats()->contains($candidat)) {
                    $service->addCandidat($candidat);
                    $candidat->addServiceSouscrit($service);
                }
            }

            // Services terminés (Si la date générée est passée)
            if ($date < new \DateTime()) {
                if ($service->getCandidats()->count() > 0) {
                    $tache->setFaite(true);
                    $gagnant = $service->getCandidats()->first();
                    $tache->setAidantAffecte($gagnant);
                    
                    if ($type === 'proposition') {
                        $service->addValidation($gagnant);
                    }
                }
            }

            $manager->persist($tache);
            $manager->persist($service);
        }

        // ======================================================
        // 7. MESSAGES
        // ======================================================
        foreach ($allGroupes as $groupe) {
            $nbMessages = $faker->numberBetween(5, 15);
            $membres = $groupe->getMembres()->toArray();
            
            if (count($membres) > 0) {
                for ($m = 0; $m < $nbMessages; $m++) {
                    $msg = new Message();
                    $msg->setDate($faker->dateTimeBetween('-1 month', 'now'));
                    $msg->setTexte($faker->realText(100));
                    $msg->setAuteur($faker->randomElement($membres));
                    $msg->setGroupe($groupe);
                    $manager->persist($msg);
                }
            }
        }

        $manager->flush();
    }
}