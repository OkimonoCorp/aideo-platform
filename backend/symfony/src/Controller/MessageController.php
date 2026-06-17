<?php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\Utilisateur;
use App\Repository\MessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Security\Voter\OwnershipVoter;

#[Route('/api/messages')]
#[IsGranted('ROLE_USER')]
class MessageController extends AbstractController
{
    /**
     * Endpoint: POST /api/messages
     * Test associé: Tests/Messages/SendMessage.http
     * - Méthode: POST
     * - Headers: Content-Type: application/json, Authorization: Bearer <token>
     * - Body JSON: { "destinataireId": <id>, "texte": "..." }
     * - Réponses:
     *   - 201 : message créé -> retourne { "id": <messageId> }
     *   - 400 : champs manquants ou tentative d'envoi à soi-même
     *   - 404 : destinataire introuvable
     */
    #[Route('', name: 'api_message.send', methods: ['POST'])]
    public function send(#[CurrentUser] Utilisateur $auteur,Request $request,EntityManagerInterface $em): JsonResponse
    {
        // 1. Récupération des données brutes
        $data = json_decode($request->getContent(), true);

        $destinataireId = $data['destinataireId'] ?? null;
        $texte = $data['texte'] ?? null;

        // 2. Validation des champs obligatoires
        if (!$destinataireId || !$texte) {
            return new JsonResponse(['error' => 'Champs manquants'], 400);
        }

        // 3. Règle métier : On ne s'écrit pas à soi-même
        if ($destinataireId == $auteur->getId()) {
            return new JsonResponse(['error' => 'Impossible de s\'auto envoyer un message'], 400);
        }

        // 4. Recherche du destinataire en base de données
        $destinataire = $em->getRepository(Utilisateur::class)->find($destinataireId);
        if (!$destinataire) {
            return new JsonResponse(['error' => 'Destinataire introuvable'], 404);
        }

        // 5. Création et hydratation de l'entité Message
        $message = new Message();
        $message
            ->setAuteur($auteur)
            ->setDestinataire($destinataire)
            ->setTexte($texte)
            ->setDate(new \DateTime());

        // 6. Sauvegarde en BDD
        $em->persist($message);
        $em->flush();

        return new JsonResponse(['id' => $message->getId()], 201);
    }

    /**
     * Endpoint: DELETE /api/messages/{id}
     * Test associé: Tests/Messages/DeleteMessage.http
     * - Méthode: DELETE
     * - Header: Authorization: Bearer <token>
     * - Paramètre: id (entier)
     * - Comportement: seul l'auteur peut supprimer (sinon AccessDeniedException)
     * - Réponse: 204 si suppression réussie
     */
    #[Route('/{id}', name: 'api_message.delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted(OwnershipVoter::MANAGE, subject: 'message', message: 'Vous ne pouvez pas supprimer ce message.')]
    public function delete(Message $message,EntityManagerInterface $em): JsonResponse
    {
        //Suppression du message
        $em->remove($message);
        $em->flush();

        return new JsonResponse(null, 204);
    }

    /**
     * Endpoint: GET /api/messages/conversation/{otherId}
     * Test associé: Tests/Messages/GetFullConversation.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Paramètre: otherId (entier)
     * - Réponses:
     *   - 200 : liste des messages échangés (triés ASC)
     *   - 404 : interlocuteur introuvable
     * - Retour: tableau d'objets { id, date, texte, auteur, destinataire }
     */
    #[Route('/conversation/{otherId}', name: 'api_message.conversation', methods: ['GET'])]
    public function conversation(#[CurrentUser] Utilisateur $me,int $otherId,MessageRepository $repo,EntityManagerInterface $em): JsonResponse
    {
        // 1. Vérifier que l'interlocuteur existe
        $other = $em->getRepository(Utilisateur::class)->find($otherId);
        if (!$other) {
            return new JsonResponse(['error' => 'Utilisateur introuvable'], 404);
        }

        // 2. Récupérer les messages envoyés OU reçus avec cet utilisateur
        // SQL équivalent : WHERE (auteur = MOI AND destinataire = LUI) OR (auteur = LUI AND destinataire = MOI)
        $messages = $repo->createQueryBuilder('m')
            ->where('(m.auteur = :me AND m.destinataire = :other)')
            ->orWhere('(m.auteur = :other AND m.destinataire = :me)')
            ->setParameter('me', $me)
            ->setParameter('other', $other)
            ->orderBy('m.date', 'ASC')
            ->getQuery()
            ->getResult();



        // 3. Formatage des données pour le frontend
        $result = [];
        foreach ($messages as $m) {
            $result[] = [
                'id' => $m->getId(),
                'date' => $m->getDate()->format(DATE_ATOM),
                'texte' => $m->getTexte(),
                'auteur' => $m->getAuteur()->getId(),
                'destinataire' => $m->getDestinataire()->getId(),
            ];
        }

        return new JsonResponse($result);
    }

    /**
     * Endpoint: GET /api/messages/conversations
     * Test associé: Tests/Messages/GetListOfConversations.http
     * - Méthode: GET
     * - Header: Authorization: Bearer <token>
     * - Retour: liste des conversations (interlocuteur + dernierMessage)
     * - Comportement: regroupe par interlocuteur en prenant le dernier message (liste triée DESC)
     */
    #[Route('/conversations', name: 'api_message.conversations', methods: ['GET'])]
    public function conversations(#[CurrentUser] Utilisateur $me,MessageRepository $repo): JsonResponse
    {
        // 1. Récupérer tous les messages où l'utilisateur courant est impliqué (envoyé ou reçu)
        $messages = $repo->createQueryBuilder('m')
            ->where('m.auteur = :me OR m.destinataire = :me')
            ->setParameter('me', $me)
            ->orderBy('m.date', 'DESC')
            ->getQuery()
            ->getResult();

        $conversations = [];



        // 2. Algorithme de regroupement manuel
        // Comme la liste est triée par date décroissante, le premier message rencontré
        // pour un interlocuteur donné est forcément le "Dernier Message" échangé.
        foreach ($messages as $message) {
            // Identifier qui est l'interlocuteur
            $other = $message->getAuteur() === $me
                ? $message->getDestinataire()
                : $message->getAuteur();

            if (!$other){
                continue;
            }
            $otherId = $other->getId();

            // Si on n'a pas encore traité cet interlocuteur, on l'ajoute
            if (!isset($conversations[$otherId])) {
                $conversations[$otherId] = [
                    'utilisateur' => [
                        'id' => $otherId,
                        'nom' => $other->getNom(),
                    ],
                    'dernierMessage' => [
                        'id' => $message->getId(),
                        'texte' => $message->getTexte(),
                        'date' => $message->getDate()->format(DATE_ATOM),
                        'envoyeParMoi' => $message->getAuteur() === $me,
                    ],
                ];
            }
        }

        // 3. On retourne les valeurs
        return new JsonResponse(array_values($conversations));
    }
}
