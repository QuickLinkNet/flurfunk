<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\Conversation;
use App\Models\Household;
use App\Models\Message;
use App\Models\User;

// Nachrichten zwischen Nachbarn, auf Haushalts-Ebene (siehe Conversation-Model).
// Kein Websocket verfuegbar (Shared Hosting) - Frontend pollt stattdessen.
final class MessageController
{
    public function index(): void
    {
        $household = $this->requireHousehold();
        $householdId = (int) $household['id'];

        $conversations = Conversation::findForHousehold($householdId);
        Response::json(array_map(fn(array $c) => $this->toPublicConversation($c, $householdId), $conversations));
    }

    public function unreadCount(): void
    {
        $household = $this->requireHousehold();
        Response::json(['count' => Conversation::countUnreadForHousehold((int) $household['id'])]);
    }

    public function show(array $params): void
    {
        $household = $this->requireHousehold();
        $householdId = (int) $household['id'];
        $conversation = $this->requireParticipantConversation((int) $params['id'], $householdId);

        Conversation::markRead((int) $conversation['id'], $householdId);
        $messages = Message::findByConversation((int) $conversation['id']);

        Response::json([
            'conversation' => $this->toPublicConversation($conversation, $householdId),
            'messages' => array_map([$this, 'toPublicMessage'], $messages),
        ]);
    }

    public function start(): void
    {
        $userId = Auth::requireLogin();
        $household = $this->requireHousehold();
        $householdId = (int) $household['id'];

        $targetHouseholdId = (int) (Request::json()['householdId'] ?? 0);
        if ($targetHouseholdId === $householdId) {
            Response::error('Du kannst nicht mit deinem eigenen Haushalt schreiben.', 422);
        }
        $targetHousehold = Household::findById($targetHouseholdId);
        if ($targetHousehold === null) {
            Response::error('Haushalt nicht gefunden.', 404);
        }

        $conversation = Conversation::findOrCreateBetween($householdId, $targetHouseholdId);
        Response::json($this->toPublicConversation($conversation, $householdId), 201);
    }

    public function send(array $params): void
    {
        $userId = Auth::requireLogin();
        $household = $this->requireHousehold();
        $householdId = (int) $household['id'];
        $conversation = $this->requireParticipantConversation((int) $params['id'], $householdId);

        $body = trim((string) (Request::json()['body'] ?? ''));
        if ($body === '') {
            Response::error('Nachricht darf nicht leer sein.', 422);
        }

        $message = Message::create((int) $conversation['id'], $userId, $body);
        Conversation::markRead((int) $conversation['id'], $householdId);

        $peerHouseholdId = (int) $conversation['household_a_id'] === $householdId
            ? (int) $conversation['household_b_id']
            : (int) $conversation['household_a_id'];

        $push = null;
        try {
            $push = PushService::sendDirectMessage($peerHouseholdId, $userId, [
                'title' => $household['name'] ?? 'Neue Nachricht',
                'body' => $body,
                'url' => '/apps/neighborhood/nachrichten/' . $conversation['id'],
            ]);
        } catch (\Throwable $e) {
            error_log('Direct message push failed: ' . $e->getMessage());
        }

        Response::json(['message' => $this->toPublicMessage($message), 'push' => $push], 201);
    }

    private function requireHousehold(): array
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $household = Household::findById((int) $user['household_id']);
        if ($household === null) {
            Response::error('Haushalt nicht gefunden.', 404);
        }
        return $household;
    }

    private function requireParticipantConversation(int $conversationId, int $householdId): array
    {
        $conversation = Conversation::findById($conversationId);
        if ($conversation === null || !Conversation::isParticipant($conversation, $householdId)) {
            Response::error('Unterhaltung nicht gefunden.', 404);
        }
        return $conversation;
    }

    // $c kommt entweder aus Conversation::findForHousehold() (hat peer_household_*
    // schon per JOIN) oder aus Conversation::findById() (nur Rohspalten) - im
    // zweiten Fall wird der Peer-Haushalt hier nachgeladen.
    private function toPublicConversation(array $c, int $viewerHouseholdId): array
    {
        $peerHouseholdId = (int) $c['household_a_id'] === $viewerHouseholdId
            ? (int) $c['household_b_id']
            : (int) $c['household_a_id'];

        $peerName = $c['peer_household_name'] ?? null;
        $peerAvatarKey = $c['peer_household_avatar_key'] ?? null;
        if ($peerName === null) {
            $peerHousehold = Household::findById($peerHouseholdId);
            $peerName = $peerHousehold['name'] ?? null;
            $peerAvatarKey = $peerHousehold['avatar_key'] ?? null;
        }

        $lastReadAt = Conversation::lastReadAtFor($c, $viewerHouseholdId);
        $unread = $c['last_message_at'] !== null
            && ($lastReadAt === null || $c['last_message_at'] > $lastReadAt);

        return [
            'id' => (int) $c['id'],
            'peerHouseholdId' => $peerHouseholdId,
            'peerHouseholdName' => $peerName,
            'peerHouseholdAvatarKey' => $peerAvatarKey,
            'lastMessageBody' => $c['last_message_body'] ?? null,
            'lastMessageAt' => $c['last_message_at'],
            'unread' => $unread,
            'createdAt' => $c['created_at'],
        ];
    }

    private function toPublicMessage(array $m): array
    {
        return [
            'id' => (int) $m['id'],
            'conversationId' => (int) $m['conversation_id'],
            'senderUserId' => (int) $m['sender_user_id'],
            'senderHouseholdId' => $m['sender_household_id'] !== null ? (int) $m['sender_household_id'] : null,
            'senderDisplayName' => $m['sender_display_name'],
            'body' => $m['body'],
            'createdAt' => $m['created_at'],
        ];
    }
}
