<?php

namespace App\Entity;

use App\Repository\ServiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
class Service
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(nullable: false)]
    private ?int $maxDemandeurs = null;

    #[ORM\OneToOne(inversedBy: 'service', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tache $tache = null;

    /**
     * @var Collection<int, Aidant>
     */
    #[ORM\ManyToMany(targetEntity: Aidant::class, inversedBy: 'servicesSouscrits')]
    private Collection $candidats;

    #[ORM\Column]
    private ?float $longitude = null;

    #[ORM\Column]
    private ?float $latitude = null;

    #[ORM\ManyToOne(inversedBy: 'serviceCree')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Aidant $aidant = null;

    #[ORM\Column(length: 255)]
    private ?string $type = null;

    /**
     * @var Collection<int, Aidant>
     */
    #[ORM\ManyToMany(targetEntity: Aidant::class)]
    #[ORM\JoinTable(name: 'service_validations')]
    private Collection $validations;

    public function __construct(
        Tache  $tache,
        ?int    $maxDemandeurs,
        float  $latitude,
        float  $longitude,
        Aidant $aidant,
        string $type
    )
    {
        $this->tache = $tache;
        $tache->setAidantAffecte($aidant);
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->aidant = $aidant;
        $this->candidats = new ArrayCollection();
        $this->maxDemandeurs = $maxDemandeurs;
        $this->type = $type;
        $aidant->addServiceCree($this);
        $aidant->addTache($tache);
        $tache->setService($this);
        $this->validations = new ArrayCollection();
    }


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMaxDemandeurs(): ?int
    {
        return $this->maxDemandeurs;
    }

    public function setMaxDemandeurs(int $maxDemandeurs): static
    {
        $this->maxDemandeurs = $maxDemandeurs;

        return $this;
    }

    public function getTache(): ?Tache
    {
        return $this->tache;
    }

    public function setTache(Tache $tache): static
    {
        $this->tache = $tache;

        return $this;
    }

    /**
     * @return Collection<int, Aidant>
     */
    public function getCandidats(): Collection
    {
        return $this->candidats;
    }

    public function addCandidat(Aidant $candidat): static
    {
        if (!$this->candidats->contains($candidat)) {
            $this->candidats->add($candidat);
        }

        return $this;
    }

    public function removeCandidat(Aidant $candidat): static
    {
        $this->candidats->removeElement($candidat);

        return $this;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function setLongitude(float $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function setLatitude(float $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    /**
     * @return Collection<int, Aidant>
     */
    public function getValidations(): Collection
    {
        return $this->validations;
    }

    public function addValidation(Aidant $aidant): static
    {
        if (!$this->validations->contains($aidant)) {
            $this->validations->add($aidant);
        }

        return $this;
    }

    public function removeValidation(Aidant $aidant): static
    {
        $this->validations->removeElement($aidant);

        return $this;
    }
}
