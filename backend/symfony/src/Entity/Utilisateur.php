<?php

namespace App\Entity;

use App\Repository\UtilisateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\InheritanceType('JOINED')]
#[ORM\DiscriminatorColumn(name: 'type', type: 'string')]
#[ORM\DiscriminatorMap([
    'utilisateur' => Utilisateur::class,
    'aidant' => Aidant::class,
    'professionnel' => Professionnel::class,
    'administrateur' => Admin::class,
])]
// ------------------------------
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    protected ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $numTel = null;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'auteur', orphanRemoval: true)]
    private Collection $messagesEnvoyes;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'destinataire', orphanRemoval: true)]
    private Collection $messagesRecu;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $photoProfil = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $photoProfilMime = null;


    public function __construct(string $email, string $nom, ?string $numTel = null)
    {
        $this->email = $email;
        $this->nom = $nom;
        $this->numTel = $numTel;

        $this->messagesEnvoyes = new ArrayCollection();
        $this->messagesRecu = new ArrayCollection();
    }
    // src/Entity/Utilisateur.php
    // ---------------------------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    // --- GETTERS/SETTERS POUR NOM ET NUM_TEL ---
    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getNumTel(): ?string
    {
        return $this->numTel;
    }

    public function setNumTel(?string $numTel): static
    {
        $this->numTel = $numTel;
        return $this;
    }
    // -------------------------------------------

    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0".self::class."\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessagesEnvoyes(): Collection
    {
        return $this->messagesEnvoyes;
    }

    public function addMessageEnvoyes(Message $message): static
    {
        if (!$this->messagesEnvoyes->contains($message)) {
            $this->messagesEnvoyes->add($message);
            $message->setAuteur($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messagesEnvoyes->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getAuteur() === $this) {
                $message->setAuteur(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessagesRecu(): Collection
    {
        return $this->messagesRecu;
    }

    public function addMessagesRecu(Message $messagesRecu): static
    {
        if (!$this->messagesRecu->contains($messagesRecu)) {
            $this->messagesRecu->add($messagesRecu);
            $messagesRecu->setDestinataire($this);
        }

        return $this;
    }

    public function removeMessagesRecu(Message $messagesRecu): static
    {
        if ($this->messagesRecu->removeElement($messagesRecu)) {
            // set the owning side to null (unless already changed)
            if ($messagesRecu->getDestinataire() === $this) {
                $messagesRecu->setDestinataire(null);
            }
        }

        return $this;
    }
    public function getPhotoProfil(): ?string
    {
        return $this->photoProfil;
    }

    public function setPhotoProfil(?string $photoProfil): self
    {
        $this->photoProfil = $photoProfil;
        return $this;
    }

    public function getPhotoProfilMime(): ?string
    {
        return $this->photoProfilMime;
    }

    public function setPhotoProfilMime(?string $mime): self
    {
        $this->photoProfilMime = $mime;
        return $this;
    }

}
