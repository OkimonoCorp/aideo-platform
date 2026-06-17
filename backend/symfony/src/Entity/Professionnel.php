<?php

namespace App\Entity;

use App\Repository\ProfessionnelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProfessionnelRepository::class)]
class Professionnel extends Utilisateur
{
    #[ORM\Column(length: 255)]
    private ?string $nomContact = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $descriptionEntr = null;

    /**
     * @var Collection<int, Adresse>
     */
    #[ORM\OneToMany(targetEntity: Adresse::class, mappedBy: 'professionnel', orphanRemoval: true)]
    private Collection $adresses;

    /**
     * @var Collection<int, Avantage>
     */
    #[ORM\OneToMany(targetEntity: Avantage::class, mappedBy: 'proprietaire', orphanRemoval: true)]
    private Collection $avantages;

    public function __construct(string $email, string $nom, string $nomContact, ?string $numTel = null)
    {
        parent::__construct($email, $nom, $numTel);
        $this->setRoles(['ROLE_PRO']);

        $this->nomContact = $nomContact;

        $this->adresses = new ArrayCollection();
        $this->avantages = new ArrayCollection();
    }

    public function getNomContact(): ?string
    {
        return $this->nomContact;
    }

    public function setNomContact(string $nomContact): static
    {
        $this->nomContact = $nomContact;

        return $this;
    }

    public function getDescriptionEntr(): ?string
    {
        return $this->descriptionEntr;
    }

    public function setDescriptionEntr(?string $descriptionEntr): static
    {
        $this->descriptionEntr = $descriptionEntr;

        return $this;
    }

    /**
     * @return Collection<int, Adresse>
     */
    public function getAdresses(): Collection
    {
        return $this->adresses;
    }

    public function addAdress(Adresse $adress): static
    {
        if (!$this->adresses->contains($adress)) {
            $this->adresses->add($adress);
            $adress->setProfessionnel($this);
        }

        return $this;
    }

    public function removeAdress(Adresse $adress): static
    {
        if ($this->adresses->removeElement($adress)) {
            // set the owning side to null (unless already changed)
            if ($adress->getProfessionnel() === $this) {
                $adress->setProfessionnel(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Avantage>
     */
    public function getAvantages(): Collection
    {
        return $this->avantages;
    }

    public function addAvantage(Avantage $avantage): static
    {
        if (!$this->avantages->contains($avantage)) {
            $this->avantages->add($avantage);
            $avantage->setProprietaire($this);
        }

        return $this;
    }

    public function removeAvantage(Avantage $avantage): static
    {
        if ($this->avantages->removeElement($avantage)) {
            // set the owning side to null (unless already changed)
            if ($avantage->getProprietaire() === $this) {
                $avantage->setProprietaire(null);
            }
        }

        return $this;
    }
}
