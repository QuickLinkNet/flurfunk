<?php

namespace App\Models;

use App\Core\Database;

// MVP-Post-Typen gemäß PRD Kapitel 3 (die 8 Kern-Typen für v1.0).
final class FeedItem
{
    public const MVP_TYPES = [
        'vacation', 'home', 'visit_expected', 'package_received',
        'tool_available', 'help_needed', 'street_closed', 'babysitter_needed',
    ];

    public static function findVisible(?string $viewerRole, ?int $viewerUserId, int $limit = 30): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT f.*, h.name AS household_name,
                COUNT(DISTINCT fr.id) AS reaction_count,
                MAX(CASE WHEN fr.user_id = ? THEN 1 ELSE 0 END) AS reacted_by_me
             FROM feed_items f
             JOIN households h ON h.id = f.household_id
             LEFT JOIN feed_reactions fr ON fr.feed_item_id = f.id
             WHERE f.visibility IN ($placeholders)
               AND (f.expires_at IS NULL OR f.expires_at > CURRENT_TIMESTAMP)
             GROUP BY f.id
             ORDER BY f.created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$viewerUserId ?? 0, ...$allowed, $limit]);
        return $stmt->fetchAll();
    }

    public static function create(
        int $householdId,
        string $type,
        ?string $message,
        string $visibility,
        ?string $expiresAt
    ): int {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO feed_items (household_id, type, message, visibility, expires_at, created_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$householdId, $type, $message, $visibility, $expiresAt]);
        return (int) Database::pdo()->lastInsertId();
    }

    // Admin-Ansicht: alle Feed-Einträge unabhängig von Sichtbarkeit/Ablauf.
    public static function findAll(int $limit = 100): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT f.*, h.name AS household_name FROM feed_items f
             JOIN households h ON h.id = f.household_id
             ORDER BY f.created_at DESC
             LIMIT ?'
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    public static function delete(int $id): void
    {
        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $pdo->prepare('DELETE FROM feed_comments WHERE feed_item_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_reactions WHERE feed_item_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_helpers WHERE feed_item_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_loans WHERE feed_item_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_items WHERE id = ?')->execute([$id]);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    public static function findVisibleById(int $id, ?string $viewerRole): ?array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT f.* FROM feed_items f
             WHERE f.id = ?
               AND f.visibility IN ($placeholders)
               AND (f.expires_at IS NULL OR f.expires_at > CURRENT_TIMESTAMP)
             LIMIT 1"
        );
        $stmt->execute([$id, ...$allowed]);
        return $stmt->fetch() ?: null;
    }

    public static function updateStatus(int $id, string $status): void
    {
        $stmt = Database::pdo()->prepare('UPDATE feed_items SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
    }

    public static function commentsForItem(int $feedItemId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT fc.*, h.name AS household_name, u.display_name AS author_name
             FROM feed_comments fc
             JOIN users u ON u.id = fc.user_id
             LEFT JOIN households h ON h.id = fc.household_id
             WHERE fc.feed_item_id = ?
             ORDER BY fc.created_at ASC
             LIMIT 50'
        );
        $stmt->execute([$feedItemId]);
        return $stmt->fetchAll();
    }

    public static function toggleReaction(int $feedItemId, int $userId): bool
    {
        $pdo = Database::pdo();
        $existing = $pdo->prepare('SELECT id FROM feed_reactions WHERE feed_item_id = ? AND user_id = ? LIMIT 1');
        $existing->execute([$feedItemId, $userId]);
        $reactionId = $existing->fetchColumn();
        if ($reactionId !== false) {
            $delete = $pdo->prepare('DELETE FROM feed_reactions WHERE id = ?');
            $delete->execute([(int) $reactionId]);
            return false;
        }

        $insert = $pdo->prepare('INSERT INTO feed_reactions (feed_item_id, user_id) VALUES (?, ?)');
        $insert->execute([$feedItemId, $userId]);
        return true;
    }

    public static function reactionCount(int $feedItemId): int
    {
        $stmt = Database::pdo()->prepare('SELECT COUNT(*) FROM feed_reactions WHERE feed_item_id = ?');
        $stmt->execute([$feedItemId]);
        return (int) $stmt->fetchColumn();
    }

    public static function addComment(int $feedItemId, int $userId, ?int $householdId, string $message): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO feed_comments (feed_item_id, user_id, household_id, message, created_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$feedItemId, $userId, $householdId, $message]);
        return (int) Database::pdo()->lastInsertId();
    }

    // "Ich kann helfen"-Zusage für Hilfe-Meldungen. Toggle wie eine Reaktion,
    // aber mit Haushaltszuordnung, damit der Ersteller sieht, wer konkret hilft.
    public static function toggleHelper(int $feedItemId, int $userId, ?int $householdId): bool
    {
        $pdo = Database::pdo();
        $existing = $pdo->prepare('SELECT id FROM feed_helpers WHERE feed_item_id = ? AND user_id = ? LIMIT 1');
        $existing->execute([$feedItemId, $userId]);
        $helperId = $existing->fetchColumn();
        if ($helperId !== false) {
            $delete = $pdo->prepare('DELETE FROM feed_helpers WHERE id = ?');
            $delete->execute([(int) $helperId]);
            return false;
        }

        $insert = $pdo->prepare('INSERT INTO feed_helpers (feed_item_id, user_id, household_id) VALUES (?, ?, ?)');
        $insert->execute([$feedItemId, $userId, $householdId]);
        return true;
    }

    public static function helpersForItem(int $feedItemId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT fh.*, h.name AS household_name
             FROM feed_helpers fh
             LEFT JOIN households h ON h.id = fh.household_id
             WHERE fh.feed_item_id = ?
             ORDER BY fh.created_at ASC
             LIMIT 50'
        );
        $stmt->execute([$feedItemId]);
        return $stmt->fetchAll();
    }

    // Verleih-Tracking für "Werkzeug verleihbar"-Meldungen. Anders als bei Helfern
    // kann ein Gegenstand immer nur an einen Haushalt gleichzeitig verliehen sein.
    public static function activeLoanForItem(int $feedItemId): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT fl.*, h.name AS household_name
             FROM feed_loans fl
             LEFT JOIN households h ON h.id = fl.household_id
             WHERE fl.feed_item_id = ? AND fl.returned_at IS NULL
             ORDER BY fl.borrowed_at DESC
             LIMIT 1'
        );
        $stmt->execute([$feedItemId]);
        return $stmt->fetch() ?: null;
    }

    public static function borrow(int $feedItemId, int $userId, ?int $householdId): bool
    {
        if (self::activeLoanForItem($feedItemId) !== null) {
            return false;
        }
        $stmt = Database::pdo()->prepare(
            'INSERT INTO feed_loans (feed_item_id, user_id, household_id) VALUES (?, ?, ?)'
        );
        $stmt->execute([$feedItemId, $userId, $householdId]);
        return true;
    }

    public static function returnLoan(int $feedItemId): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE feed_loans SET returned_at = CURRENT_TIMESTAMP WHERE feed_item_id = ? AND returned_at IS NULL'
        );
        $stmt->execute([$feedItemId]);
    }
}
