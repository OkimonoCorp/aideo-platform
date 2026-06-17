<?php

namespace App\Entity;

use App\Repository\AidantRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AidantRepository::class)]
class Aidant extends Utilisateur
{
    #[ORM\Column(length: 255)]
    private ?string $prenom = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $pseudo = null;

    #[ORM\Column]
    private ?int $pts = 0;

    /**
     * @var Collection<int, Groupe>
     */
    #[ORM\ManyToMany(targetEntity: Groupe::class, mappedBy: 'membres')]
    private Collection $groupes;

    /**
     * @var Collection<int, Tache>
     */
    #[ORM\OneToMany(targetEntity: Tache::class, mappedBy: 'aidantAffecte')]
    private Collection $taches;

    /**
     * @var Collection<int, Service>
     */
    #[ORM\ManyToMany(targetEntity: Service::class, mappedBy: 'candidats')]
    private Collection $servicesSouscrit;

    /**
     * @var Collection<int, AchatAvantage>
     */
    #[ORM\OneToMany(targetEntity: AchatAvantage::class, mappedBy: 'aidant', orphanRemoval: true)]
    private Collection $achats;

    /**
     * @var Collection<int, self>
     */
    #[ORM\ManyToMany(targetEntity: self::class, inversedBy: 'aidants')]
    private Collection $amis;

    /**
     * @var Collection<int, self>
     */
    #[ORM\ManyToMany(targetEntity: self::class, mappedBy: 'amis')]
    private Collection $aidants;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $adresse = null;

    /**
     * @var Collection<int, Service>
     */
    #[ORM\OneToMany(targetEntity: Service::class, mappedBy: 'aidant', orphanRemoval: true)]
    private Collection $serviceCree;

// src/Entity/Aidant.php

    public function __construct(string $email, string $nom, string $prenom, ?string $numTel = null, ?string $adresse = null)
    {
        parent::__construct($email, $nom, $numTel);
        $this->setRoles(['ROLE_AIDANT']);

        $this->prenom = $prenom;
        $this->adresse = $adresse;

        $this->groupes = new ArrayCollection();
        $this->taches = new ArrayCollection();
        $this->servicesSouscrit = new ArrayCollection();
        $this->achats = new ArrayCollection();
        $this->amis = new ArrayCollection();
        $this->aidants = new ArrayCollection();
        $this->serviceCree = new ArrayCollection();

    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(?string $pseudo): static
    {
        $this->pseudo = $pseudo;

        return $this;
    }

    public function getPts(): ?int
    {
        return $this->pts;
    }

    public function setPts(int $pts): static
    {
        $this->pts = $pts;

        return $this;
    }

    /**
     * @return Collection<int, Groupe>
     */
    public function getGroupes(): Collection
    {
        return $this->groupes;
    }

    public function addGroupe(Groupe $groupe): static
    {
        if (!$this->groupes->contains($groupe)) {
            $this->groupes->add($groupe);
            $groupe->addMembre($this);
        }

        return $this;
    }

    public function removeGroupe(Groupe $groupe): static
    {
        if ($this->groupes->removeElement($groupe)) {
            $groupe->removeMembre($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Tache>
     */
    public function getTaches(): Collection
    {
        return $this->taches;
    }

    public function addTache(Tache $tache): static
    {
        if (!$this->taches->contains($tache)) {
            $this->taches->add($tache);
        }

        return $this;
    }

    public function removeTache(Tache $tache): static
    {
        if ($this->taches->removeElement($tache)) {
            // set the owning side to null (unless already changed)
            if ($tache->getAidantAffecte() === $this) {
                $tache->setAidantAffecte(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Service>
     */
    public function getServicesSouscrit(): Collection
    {
        return $this->servicesSouscrit;
    }

    public function addServiceSouscrit(Service $service): static
    {
        if (!$this->servicesSouscrit->contains($service)) {
            $this->servicesSouscrit->add($service);
            $service->addCandidat($this);
        }

        return $this;
    }

    public function removeServiceSouscrit(Service $service): static
    {
        if ($this->servicesSouscrit->removeElement($service)) {
            $service->removeCandidat($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getAmis(): Collection
    {
        return $this->amis;
    }

    public function addAmi(self $ami): static
    {
        if (!$this->amis->contains($ami)) {
            $this->amis->add($ami);
        }

        return $this;
    }

    public function removeAmi(self $ami): static
    {
        $this->amis->removeElement($ami);

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getAidants(): Collection
    {
        return $this->aidants;
    }

    public function addAidant(self $aidant): static
    {
        if (!$this->aidants->contains($aidant)) {
            $this->aidants->add($aidant);
            $aidant->addAmi($this);
        }

        return $this;
    }

    public function removeAidant(self $aidant): static
    {
        if ($this->aidants->removeElement($aidant)) {
            $aidant->removeAmi($this);
        }

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    /**
     * @return Collection<int, Service>
     */
    public function getServiceCree(): Collection
    {
        return $this->serviceCree;
    }

    public function addServiceCree(Service $serviceCree): static
    {
        if (!$this->serviceCree->contains($serviceCree)) {
            $this->serviceCree->add($serviceCree);
            $serviceCree->setAidant($this);
        }

        return $this;
    }

    public function removeServiceCree(Service $serviceCree): static
    {
        if ($this->serviceCree->removeElement($serviceCree)) {
            // set the owning side to null (unless already changed)
            if ($serviceCree->getAidant() === $this) {
                $serviceCree->setAidant(null);
            }
        }

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
            $achat->setAidant($this);
        }

        return $this;
    }

    public function removeAchat(AchatAvantage $achat): static
    {
        if ($this->achats->removeElement($achat)) {
            // set the owning side to null (unless already changed)
            if ($achat->getAidant() === $this) {
                $achat->setAidant(null);
            }
        }

        return $this;
    }

    /**
     * Méthode utilitaire pour récupérer directement la liste des avantages possédés
     * Utile pour tes API "Mes Avantages"
     * @return array<Avantage>
     */
    public function getAvantagesObtenus(): array
    {
        return $this->achats->map(fn(AchatAvantage $achat) => $achat->getAvantage())->toArray();
    }
}
