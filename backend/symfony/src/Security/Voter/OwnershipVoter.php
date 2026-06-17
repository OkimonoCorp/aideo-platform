<?php

namespace App\Security\Voter;

use App\Entity\Adresse;
use App\Entity\Avantage;
use App\Entity\Message;
use App\Entity\Service;
use App\Entity\Groupe;
use App\Entity\Tache;
use App\Entity\Utilisateur;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;

class OwnershipVoter extends Voter
{
    public const MANAGE = 'MANAGE';
    public const VALIDATE = 'SERVICE_VALIDATE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        // On vérifie d'abord l'attribut
        if ($attribute !== self::MANAGE && $attribute !== self::VALIDATE) {
            return false;
        }

        // On vérifie que le sujet est l'une de nos entités gérées
        return $subject instanceof Tache
            || $subject instanceof Service
            || $subject instanceof Avantage
            || $subject instanceof Message
            || $subject instanceof Utilisateur
            || $subject instanceof Adresse
            || $subject instanceof Groupe;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $user = $token->getUser();

        if (!$user instanceof Utilisateur) {
            return false;
        }

        // CAS 1 : VALIDATION (Uniquement pour les Services)
        if ($attribute === self::VALIDATE) {
            
            // Sécurité : On s'assure que le sujet est bien un Service
            if (!$subject instanceof Service) {
                return false;
            }
            
            $service = $subject; 

            // 1. Si la tâche est déjà faite, personne n'a le droit de re-valider
            if ($service->getTache()->isFaite()) {
                return false;
            }

            // 2. Si c'est une demande : Seul le Créateur peut valider
            if ($service->getType() === 'demande') {
                return $service->getAidant()->getId() === $user->getId();
            }

            // 3. Si c'est une proposition : Seul un Candidat inscrit peut valider, et seulement s'il n'a pas encore validé
            if ($service->getType() === 'proposition') {
                return $service->getCandidats()->contains($user) && !$service->getValidations()->contains($user);
            }

            return false;
        }

        // CAS 2 : GESTION / MODIFICATION (Manage)
        if ($attribute === self::MANAGE) {
            
            // 1. Tâche
            if ($subject instanceof Tache) {
                return $subject->getAidantAffecte()?->getId() === $user->getId();
            }

            // 2. Service
            if ($subject instanceof Service) {
                return $subject->getAidant()?->getId() === $user->getId();
            }

            // 3. Message
            if ($subject instanceof Message) {
                return $subject->getAuteur()?->getId() === $user->getId();
            }

            // 4. Avantage
            if ($subject instanceof Avantage) {
                return $subject->getProprietaire()?->getId() === $user->getId();
            }

            // 5. Adresse
            if ($subject instanceof Adresse) {
                return $subject->getProfessionnel()?->getId() === $user->getId();
            }
            
            // 6. Utilisateur (Se modifier soi-même)
            if ($subject instanceof Utilisateur) {
                return $subject->getId() === $user->getId();
            }

            // 7. GROUPE
            if ($subject instanceof Groupe) {
                foreach ($subject->getMembres() as $membre) {
                    if ($membre->getId() === $user->getId()) {
                        return true;
                    }
                }
                return false;
            }
        }

        return false;
    }
}