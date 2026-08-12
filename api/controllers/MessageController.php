<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\AudioUpload;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\Conversation;
use App\Models\Household;
use App\Models\Message;
use App\Models\User;

// Nachrichten zwischen Nachbarn, auf Personen-Ebene (siehe Conversation-Model -
// bewusst nicht Haushalts-Ebene, damit auch Leute im selben Haushalt sich
// gegenseitig schreiben koennen). Kein Websocket verfuegbar (Shared Hosting) -
// Frontend pollt stattdessen.
final class MessageController
{
    public function index(): void
    {
        $userId = Auth::requireLogin();
        $conversations = Conversation::findForUser($userId);
        Response::json(array_map(fn(array $c) => $this->toPublicConversation($c, $userId), $conversations));
    }

    public function unreadCount(): void
    {
        $userId = Auth::requireLogin();
        Response::json(['count' => Conversation::countUnreadForUser($userId)]);
    }

    public function show(array $params): void
    {
        $userId = Auth::requireLogin();
        $conversation = $this->requireParticipantConversation((int) $params['id'], $userId);

        Conversation::markRead((int) $conversation['id'], $userId);
        $messages = Message::findByConversation((int) $conversation['id']);

        Response::json([
            'conversation' => $this->toPublicConversation($conversation, $userId),
            'messages' => array_map([$this, 'toPublicMessage'], $messages),
        ]);
    }

    public function start(): void
    {
        $userId = Auth::requireLogin();

        $targetUserId = (int) (Request::json()['userId'] ?? 0);
        if ($targetUserId === $userId) {
            Response::error('Du kannst dir nicht selbst schreiben.', 422);
        }
        $targetUser = User::findById($targetUserId);
        if ($targetUser === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }

        $conversation = Conversation::findOrCreateBetween($userId, $targetUserId);
        Response::json($this->toPublicConversation($conversation, $userId), 201);
    }

    public function send(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        $conversation = $this->requireParticipantConversation((int) $params['id'], $userId);

        $body = trim((string) (Request::json()['body'] ?? ''));
        if ($body === '') {
            Response::error('Nachricht darf nicht leer sein.', 422);
        }

        $message = Message::create((int) $conversation['id'], $userId, $body);
        Conversation::markRead((int) $conversation['id'], $userId);

        $peerUserId = (int) $conversation['user_a_id'] === $userId
            ? (int) $conversation['user_b_id']
            : (int) $conversation['user_a_id'];

        $push = null;
        try {
            $push = PushService::sendDirectMessage($peerUserId, [
                'title' => $user['display_name'] ?? 'Neue Nachricht',
                'body' => $body,
                'url' => '/apps/neighborhood/nachrichten/' . $conversation['id'],
            ]);
        } catch (\Throwable $e) {
            error_log('Direct message push failed: ' . $e->getMessage());
        }

        Response::json(['message' => $this->toPublicMessage($message), 'push' => $push], 201);
    }

    public function sendVoice(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        $conversation = $this->requireParticipantConversation((int) $params['id'], $userId);

        $durationSeconds = isset($_POST['duration']) ? max(1, (int) $_POST['duration']) : null;
        $audioPath = AudioUpload::save($_FILES['audio'] ?? null, Message::audioStorageDir());

        $message = Message::create((int) $conversation['id'], $userId, '🎤 Sprachnachricht', $audioPath, $durationSeconds);
        Conversation::markRead((int) $conversation['id'], $userId);

        $peerUserId = (int) $conversation['user_a_id'] === $userId
            ? (int) $conversation['user_b_id']
            : (int) $conversation['user_a_id'];

        $push = null;
        try {
            $push = PushService::sendDirectMessage($peerUserId, [
                'title' => $user['display_name'] ?? 'Neue Nachricht',
                'body' => '🎤 Sprachnachricht',
                'url' => '/apps/neighborhood/nachrichten/' . $conversation['id'],
            ]);
        } catch (\Throwable $e) {
            error_log('Direct message push failed: ' . $e->getMessage());
        }

        Response::json(['message' => $this->toPublicMessage($message), 'push' => $push], 201);
    }

    private function requireParticipantConversation(int $conversationId, int $userId): array
    {
        $conversation = Conversation::findById($conversationId);
        if ($conversation === null || !Conversation::isParticipant($conversation, $userId)) {
            Response::error('Unterhaltung nicht gefunden.', 404);
        }
        return $conversation;
    }

    // $c kommt entweder aus Conversation::findForUser() (hat peer_* schon per
    // JOIN) oder aus Conversation::findById() (nur Rohspalten) - im zweiten
    // Fall wird die Gegenperson hier nachgeladen.
    private function toPublicConversation(array $c, int $viewerUserId): array
    {
        $peerUserId = (int) $c['user_a_id'] === $viewerUserId
            ? (int) $c['user_b_id']
            : (int) $c['user_a_id'];

        $peerName = $c['peer_display_name'] ?? null;
        $peerAvatarPhotoPath = $c['peer_avatar_photo_path'] ?? null;
        $peerHouseholdName = $c['peer_household_name'] ?? null;
        $peerHouseholdAvatarKey = $c['peer_household_avatar_key'] ?? null;
        if ($peerName === null) {
            $peerUser = User::findById($peerUserId);
            $peerName = $peerUser['display_name'] ?? null;
            $peerAvatarPhotoPath = $peerUser['avatar_photo_path'] ?? null;
            if ($peerUser !== null && $peerUser['household_id'] !== null) {
                $peerHousehold = Household::findById((int) $peerUser['household_id']);
                $peerHouseholdName = $peerHousehold['name'] ?? null;
                $peerHouseholdAvatarKey = $peerHousehold['avatar_key'] ?? null;
            }
        }

        $lastReadAt = Conversation::lastReadAtFor($c, $viewerUserId);
        $unread = $c['last_message_at'] !== null
            && ($lastReadAt === null || $c['last_message_at'] > $lastReadAt);

        return [
            'id' => (int) $c['id'],
            'peerUserId' => $peerUserId,
            'peerDisplayName' => $peerName,
            'peerAvatarPhotoUrl' => User::avatarPhotoUrl($peerAvatarPhotoPath),
            'peerHouseholdName' => $peerHouseholdName,
            'peerHouseholdAvatarKey' => $peerHouseholdAvatarKey,
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
            'senderDisplayName' => $m['sender_display_name'],
            'body' => $m['body'],
            'audioUrl' => Message::audioUrl($m['audio_path'] ?? null),
            'audioDurationSeconds' => $m['audio_duration_seconds'] !== null ? (int) $m['audio_duration_seconds'] : null,
            'createdAt' => $m['created_at'],
        ];
    }
}
