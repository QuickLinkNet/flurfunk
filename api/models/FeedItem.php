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

    public static function findVisible(?string $viewerRole, int $limit = 30): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT f.*, h.name AS household_name FROM feed_items f
             JOIN households h ON h.id = f.household_id
             WHERE f.visibility IN ($placeholders)
               AND (f.expires_at IS NULL OR f.expires_at > CURRENT_TIMESTAMP)
             ORDER BY f.created_at DESC
             LIMIT ?"
        );
        $stmt->execute([...$allowed, $limit]);
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
}
