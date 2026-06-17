<?php

namespace App\Entity;

use App\Repository\TacheRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TacheRepository::class)]
class Tache
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    private ?string $description = null;

    #[ORM\Column]
    private ?\DateTime $date = null;

    #[ORM\Column]
    private ?float $duree = null;

    #[ORM\Column]
    private ?bool $faite = null;

    #[ORM\ManyToOne(inversedBy: 'taches')]
    private ?Aidant $aidantAffecte = null;

    #[ORM\OneToOne(mappedBy: 'tache', cascade: ['persist', 'remove'])]
    private ?Service $service = null;

    public function __construct(
        string $nom,
        string $description,
        \DateTime $date,
        float $duree,
        ?Aidant $aidantAffecte,
    ) {
        $this->nom = $nom;
        $this->description = $description;
        $this->date = $date;
        $this->duree = $duree;

        $this->faite = false;
        $this->aidantAffecte = $aidantAffecte;
        if ($aidantAffecte !== null) {
            $aidantAffecte->addTache($this);
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getHeureDebut(): ?float
    {
        // Retourne l'heure de début sous forme décimale (H.i), ou null si la date n'est pas définie
        return $this->date ? (float) $this->date->format('H.i') : null;
    }

    public function getDuree(): ?float
    {
        return $this->duree;
    }

    public function setDuree(float $duree): static
    {
        $this->duree = $duree;

        return $this;
    }

    public function isFaite(): ?bool
    {
        return $this->faite;
    }

    public function setFaite(bool $faite): static
    {
        $this->faite = $faite;

        return $this;
    }

    public function getAidantAffecte(): ?Aidant
    {
        return $this->aidantAffecte;
    }

    public function setAidantAffecte(?Aidant $aidantAffecte): static
    {
        $this->aidantAffecte = $aidantAffecte;

        return $this;
    }

    public function getService(): ?Service
    {
        return $this->service;
    }

    public function setService(Service $service): static
    {
        // set the owning side of the relation if necessary
        if ($service->getTache() !== $this) {
            $service->setTache($this);
        }

        $this->service = $service;

        return $this;
    }
}
