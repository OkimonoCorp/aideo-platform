<?php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\Groupe;
use App\Entity\Utilisateur;
use App\Repository\MessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Security\Voter\OwnershipVoter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/messages-groupe')]
#[IsGranted('ROLE_USER')]
class MessageGroupeController extends AbstractController
{
    /**
     * Endpoint: POST /api/messages-groupe
     * - Méthode: POST
     * - Header: Content-Type: application/json, Authorization: Bearer <token>
     * - Body JSON attendu: { "groupeId": <id>, "texte": "..." }
     * - Comportement: vérifie que l'utilisateur est membre du groupe, puis crée et enregistre le message de groupe
     * - Réponses:
     *   - 201 : message envoyé { "id": <messageId>, "status": "..." }
     *   - 400 : données manquantes
     *   - 403 : non membre du groupe
     *   - 404 : groupe introuvable
     */
    #[Route('', name: 'api_message_groupe.send', methods: ['POST'])]
    public function send(#[CurrentUser] Utilisateur $auteur,Request $request,EntityManagerInterface $em): JsonResponse 
    {
        // 1. Récupération des données
        $data = json_decode($request->getContent(), true);
        $groupeId = $data['groupeId'] ?? null;
        $texte = $data['texte'] ?? null;

        if (!$groupeId || !$texte) {
            return new JsonResponse(['error' => 'Groupe ID et texte sont requis'], 400);
        }

        // 2. Récupération du groupe
        $groupe = $em->getRepository(Groupe::class)->find($groupeId);

        if (!$groupe) {
            return new JsonResponse(['error' => 'Groupe introuvable'], 404);
        }

        // 3. ANTI IDOR : L'auteur doit être membre du groupe (on appelle manuellement le voter)
        $this->denyAccessUnlessGranted(OwnershipVoter::MANAGE, $groupe, 'Vous ne faites pas partie de ce groupe');

        // 4. Création du message
        $message = new Message();
        $message->setAuteur($auteur);
        $message->setGroupe($groupe);
        $message->setTexte($texte);
        $message->setDate(new \DateTime());
        
        // null pour le destinataire privé car c'est un groupe
        $message->setDestinataire(null); 

        $em->persist($message);
        $em->flush();

        return new JsonResponse(['id' => $message->getId(), 'status' => 'Message envoyé au groupe'], 201);
    }

    /**
     * Endpoint: GET /api/messages-groupe/groupe/{id}
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Paramètre: id (entier du groupe)
     * - Comportement: vérifie que l'utilisateur est membre, puis retourne l'historique des messages du groupe (triés ASC)
     * - Réponses:
     *   - 200 : tableau des messages [{ id, date, texte, auteur: { id, nom, estMoi } }, ...]
     *   - 403 : accès interdit (non membre)
     */
    #[Route('/groupe/{id}', name: 'api_message_groupe.conversation', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'groupe', message: 'Accès interdit à ce groupe')]
    public function conversationGroupe(#[CurrentUser] Utilisateur $user,Groupe $groupe,MessageRepository $repo): JsonResponse 
    {
        // 1. Récupérer les messages liés à ce groupe
        $messages = $repo->findBy(
            ['groupe' => $groupe], 
            ['date' => 'ASC']
        );

        // 2. Formatage
        $result = [];
        foreach ($messages as $m) {
            $auteur = $m->getAuteur();
            
            $result[] = [
                'id' => $m->getId(),
                'date' => $m->getDate()->format(DATE_ATOM),
                'texte' => $m->getTexte(),
                // On renvoie plus d'infos sur l'auteur car dans un groupe, il faut savoir qui parle
                'auteur' => [
                    'id' => $auteur->getId(),
                    'nom' => $auteur->getNom(),
                    'estMoi' => $auteur === $user 
                ]
            ];
        }

        return new JsonResponse($result);
    }

    /**
     * Endpoint: DELETE /api/messages-groupe/{id}
     * - Méthode: DELETE
     * - Header: Authorization: Bearer <token>
     * - Paramètre: id (entier du message)
     * - Comportement: vérifie que c'est un message de groupe et que l'utilisateur est l'auteur, puis supprime
     * - Réponses:
     *   - 204 : suppression réussie
     *   - 400 : pas un message de groupe
     *   - AccessDeniedException : non auteur
     */
    #[Route('/{id}', name: 'api_message_groupe.delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'message', message: 'Vous ne pouvez pas supprimer ce message.')]
    public function delete(Message $message,EntityManagerInterface $em): JsonResponse 
    {
        // On vérifie que c'est un message de groupe
        if ($message->getGroupe() === null) {
             return new JsonResponse(['error' => 'Ce n\'est pas un message de groupe'], 400);
        }
        $em->remove($message);
        $em->flush();

        return new JsonResponse(null, 204);
    }
}