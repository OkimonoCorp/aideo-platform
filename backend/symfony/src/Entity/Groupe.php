<?php

namespace App\Entity;

use App\Repository\GroupeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GroupeRepository::class)]
class Groupe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    /**
     * @var Collection<int, Aidant>
     */
    #[ORM\ManyToMany(targetEntity: Aidant::class, inversedBy: 'groupes')]
    private Collection $membres;

    #[ORM\OneToMany(mappedBy: 'groupe', targetEntity: Message::class, cascade: ['remove'])]
    private Collection $messages;

    public function __construct()
    {
        $this->membres = new ArrayCollection();
        $this->messages = new ArrayCollection();
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

    /**
     * @return Collection<int, Aidant>
     */
    public function getMembres(): Collection
    {
        return $this->membres;
    }

    public function addMembre(Aidant $membre): static
    {
        if (!$this->membres->contains($membre)) {
            $this->membres->add($membre);
        }

        return $this;
    }

    public function removeMembre(Aidant $membre): static
    {
        $this->membres->removeElement($membre);

        return $this;
    }
}
