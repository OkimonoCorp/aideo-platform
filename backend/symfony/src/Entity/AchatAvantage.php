<?php

namespace App\Entity;

use App\Repository\AchatAvantageRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AchatAvantageRepository::class)]
class AchatAvantage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'achats')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Aidant $aidant = null;

    #[ORM\ManyToOne(inversedBy: 'achats')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Avantage $avantage = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $dateAchat = null;

    public function __construct()
    {
        $this->dateAchat = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAidant(): ?Aidant
    {
        return $this->aidant;
    }

    public function setAidant(?Aidant $aidant): static
    {
        $this->aidant = $aidant;
        return $this;
    }

    public function getAvantage(): ?Avantage
    {
        return $this->avantage;
    }

    public function setAvantage(?Avantage $avantage): static
    {
        $this->avantage = $avantage;
        return $this;
    }

    public function getDateAchat(): ?\DateTimeImmutable
    {
        return $this->dateAchat;
    }
}