<?php

namespace App\Entity;

use App\Repository\AdminRepository;
use Couchbase\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AdminRepository::class)]
class Admin extends Utilisateur
{
    #[ORM\Column(length: 255)]
    private ?string $prenom = null;

    public function __construct(string $email, string $nom, string $prenom, ?string $numTel = null)
    {
        parent::__construct($email, $nom, $numTel);
        $this->setRoles(['ROLE_ADMIN']);

        $this->prenom = $prenom;
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
}
