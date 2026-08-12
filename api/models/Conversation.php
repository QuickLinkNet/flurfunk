<?php

namespace App\Models;

use App\Core\Database;

// Nachrichten laufen auf Personen-Ebene: eine Unterhaltung gehoert zwei
// Nutzern, nicht zwei Haushalten. Wichtig, weil mehrkoepfige Haushalte hier
// die Regel sind - Personen im selben Haushalt sollen sich trotzdem
// gegenseitig schreiben koennen (frueherer Haushalts-Ansatz hat das
// verhindert).
final class Conversation
{
    public static function findOrCreateBetween(int $userIdA, int $userIdB): array
    {
        [$a, $b] = $userIdA < $userIdB ? [$userIdA, $userIdB] : [$userIdB, $userIdA];

        $pdo = Database::pdo();
        $stmt = $pdo->prepare(
            'INSERT OR IGNORE INTO conversations (user_a_id, user_b_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$a, $b]);

        return self::findBetween($a, $b) ?? throw new \RuntimeException('Unterhaltung konnte nicht angelegt werden.');
    }

    public static function findBetween(int $userIdA, int $userIdB): ?array
    {
        [$a, $b] = $userIdA < $userIdB ? [$userIdA, $userIdB] : [$userIdB, $userIdA];
        $stmt = Database::pdo()->prepare('SELECT * FROM conversations WHERE user_a_id = ? AND user_b_id = ?');
        $stmt->execute([$a, $b]);
        return $stmt->fetch() ?: null;
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT c.*,
                    (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_message_body
             FROM conversations c
             WHERE c.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findForUser(int $userId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT c.*,
                    CASE WHEN c.user_a_id = ? THEN c.user_b_id ELSE c.user_a_id END AS peer_user_id,
                    pu.display_name AS peer_display_name,
                    pu.avatar_photo_path AS peer_avatar_photo_path,
                    ph.name AS peer_household_name,
                    ph.avatar_key AS peer_household_avatar_key,
                    (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_message_body
             FROM conversations c
             JOIN users pu ON pu.id = CASE WHEN c.user_a_id = ? THEN c.user_b_id ELSE c.user_a_id END
             LEFT JOIN households ph ON ph.id = pu.household_id
             WHERE c.user_a_id = ? OR c.user_b_id = ?
             ORDER BY COALESCE(c.last_message_at, c.created_at) DESC'
        );
        $stmt->execute([$userId, $userId, $userId, $userId]);
        return $stmt->fetchAll();
    }

    public static function isParticipant(array $conversation, int $userId): bool
    {
        return (int) $conversation['user_a_id'] === $userId || (int) $conversation['user_b_id'] === $userId;
    }

    public static function lastReadAtFor(array $conversation, int $userId): ?string
    {
        return (int) $conversation['user_a_id'] === $userId
            ? $conversation['user_a_last_read_at']
            : $conversation['user_b_last_read_at'];
    }

    public static function markRead(int $conversationId, int $userId): void
    {
        $conversation = self::findById($conversationId);
        if ($conversation === null || !self::isParticipant($conversation, $userId)) {
            return;
        }
        $column = (int) $conversation['user_a_id'] === $userId ? 'user_a_last_read_at' : 'user_b_last_read_at';
        $stmt = Database::pdo()->prepare("UPDATE conversations SET $column = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$conversationId]);
    }

    public static function touchLastMessageAt(int $conversationId): void
    {
        $stmt = Database::pdo()->prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$conversationId]);
    }

    public static function countUnreadForUser(int $userId): int
    {
        $stmt = Database::pdo()->prepare(
            'SELECT COUNT(*) FROM conversations c
             WHERE (c.user_a_id = ? OR c.user_b_id = ?)
               AND c.last_message_at IS NOT NULL
               AND c.last_message_at > COALESCE(
                    CASE WHEN c.user_a_id = ? THEN c.user_a_last_read_at ELSE c.user_b_last_read_at END,
                    ?
               )'
        );
        $stmt->execute([$userId, $userId, $userId, '1970-01-01']);
        return (int) $stmt->fetchColumn();
    }
}
