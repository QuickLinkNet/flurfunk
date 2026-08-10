<?php

namespace App\Models;

use App\Core\Database;

// Nachrichten laufen auf Haushalts-Ebene (wie Feed/Events auch): eine
// Unterhaltung gehört zwei Haushalten, einzelne Nachrichten kennen aber
// weiterhin den schreibenden Nutzer (sender_user_id) fuer die Anzeige,
// wenn ein Haushalt mehrere Mitglieder hat.
final class Conversation
{
    public static function findOrCreateBetween(int $householdIdA, int $householdIdB): array
    {
        [$a, $b] = $householdIdA < $householdIdB ? [$householdIdA, $householdIdB] : [$householdIdB, $householdIdA];

        $pdo = Database::pdo();
        $stmt = $pdo->prepare(
            'INSERT OR IGNORE INTO conversations (household_a_id, household_b_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$a, $b]);

        return self::findBetween($a, $b) ?? throw new \RuntimeException('Unterhaltung konnte nicht angelegt werden.');
    }

    public static function findBetween(int $householdIdA, int $householdIdB): ?array
    {
        [$a, $b] = $householdIdA < $householdIdB ? [$householdIdA, $householdIdB] : [$householdIdB, $householdIdA];
        $stmt = Database::pdo()->prepare('SELECT * FROM conversations WHERE household_a_id = ? AND household_b_id = ?');
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

    public static function findForHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT c.*,
                    CASE WHEN c.household_a_id = ? THEN c.household_b_id ELSE c.household_a_id END AS peer_household_id,
                    ph.name AS peer_household_name,
                    ph.avatar_key AS peer_household_avatar_key,
                    (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_message_body,
                    (SELECT sender_user_id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_message_sender_id
             FROM conversations c
             JOIN households ph ON ph.id = CASE WHEN c.household_a_id = ? THEN c.household_b_id ELSE c.household_a_id END
             WHERE c.household_a_id = ? OR c.household_b_id = ?
             ORDER BY COALESCE(c.last_message_at, c.created_at) DESC'
        );
        $stmt->execute([$householdId, $householdId, $householdId, $householdId]);
        return $stmt->fetchAll();
    }

    public static function isParticipant(array $conversation, int $householdId): bool
    {
        return (int) $conversation['household_a_id'] === $householdId || (int) $conversation['household_b_id'] === $householdId;
    }

    public static function lastReadAtFor(array $conversation, int $householdId): ?string
    {
        return (int) $conversation['household_a_id'] === $householdId
            ? $conversation['household_a_last_read_at']
            : $conversation['household_b_last_read_at'];
    }

    public static function markRead(int $conversationId, int $householdId): void
    {
        $conversation = self::findById($conversationId);
        if ($conversation === null || !self::isParticipant($conversation, $householdId)) {
            return;
        }
        $column = (int) $conversation['household_a_id'] === $householdId ? 'household_a_last_read_at' : 'household_b_last_read_at';
        $stmt = Database::pdo()->prepare("UPDATE conversations SET $column = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$conversationId]);
    }

    public static function touchLastMessageAt(int $conversationId): void
    {
        $stmt = Database::pdo()->prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$conversationId]);
    }

    public static function countUnreadForHousehold(int $householdId): int
    {
        $stmt = Database::pdo()->prepare(
            'SELECT COUNT(*) FROM conversations c
             WHERE (c.household_a_id = ? OR c.household_b_id = ?)
               AND c.last_message_at IS NOT NULL
               AND c.last_message_at > COALESCE(
                    CASE WHEN c.household_a_id = ? THEN c.household_a_last_read_at ELSE c.household_b_last_read_at END,
                    "1970-01-01"
               )'
        );
        $stmt->execute([$householdId, $householdId, $householdId]);
        return (int) $stmt->fetchColumn();
    }
}
