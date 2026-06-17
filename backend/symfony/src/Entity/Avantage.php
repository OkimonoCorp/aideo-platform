<?php

namespace App\Entity;

use App\Repository\AvantageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AvantageRepository::class)]
class Avantage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $lienQR = null;

    #[ORM\Column]
    private ?float $prix = null;

    #[ORM\Column]
    private ?bool $approuve = null;

    #[ORM\ManyToOne(inversedBy: 'avantages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Professionnel $proprietaire = null;

    /**
     * @var Collection<int, AchatAvantage>
     */
    #[ORM\OneToMany(targetEntity: AchatAvantage::class, mappedBy: 'avantage', cascade: ['remove'], orphanRemoval: true)]
    private Collection $achats;

    public function __construct()
    {
        $this->achats = new ArrayCollection();
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

    public function getLienQR(): ?string
    {
        return $this->lienQR;
    }

    public function setLienQR(string $lienQR): static
    {
        $this->lienQR = $lienQR;

        return $this;
    }

    public function getPrix(): ?float
    {
        return $this->prix;
    }

    public function setPrix(float $prix): static
    {
        $this->prix = $prix;

        return $this;
    }

    public function isApprouve(): ?bool
    {
        return $this->approuve;
    }

    public function setApprouve(bool $approuve): static
    {
        $this->approuve = $approuve;

        return $this;
    }

    public function getProprietaire(): ?Professionnel
    {
        return $this->proprietaire;
    }

    public function setProprietaire(?Professionnel $proprietaire): static
    {
        $this->proprietaire = $proprietaire;

        return $this;
    }

    /**
     * @return Collection<int, AchatAvantage>
     */
    public function getAchats(): Collection
    {
        return $this->achats;
    }

    public function addAchat(AchatAvantage $achat): static
    {
        if (!$this->achats->contains($achat)) {
            $this->achats->add($achat);
            $achat->setAvantage($this);
        }

        return $this;
    }

    public function removeAchat(AchatAvantage $achat): static
    {
        if ($this->achats->removeElement($achat)) {
            // set the owning side to null (unless already changed)
            if ($achat->getAvantage() === $this) {
                $achat->setAvantage(null);
            }
        }

        return $this;
    }
}
