<?php

namespace App\Models;

use App\Core\Database;

final class Event
{
    public const TYPES = [
        'bbq', 'campfire', 'street_festival', 'kids_play', 'football',
        'pool_party', 'mulled_wine', 'christmas_party', 'other',
    ];

    public static function findUpcoming(?string $viewerRole, int $limit = 50): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT e.*, h.name AS creator_household_name,
                SUM(CASE WHEN er.response = 'yes' THEN 1 ELSE 0 END) AS yes_count,
                SUM(CASE WHEN er.response = 'maybe' THEN 1 ELSE 0 END) AS maybe_count,
                SUM(CASE WHEN er.response = 'no' THEN 1 ELSE 0 END) AS no_count
             FROM events e
             JOIN households h ON h.id = e.creator_household_id
             LEFT JOIN event_responses er ON er.event_id = e.id
             WHERE e.visibility IN ($placeholders)
             GROUP BY e.id
             ORDER BY e.starts_at ASC
             LIMIT ?"
        );
        $stmt->execute([...$allowed, $limit]);
        return $stmt->fetchAll();
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT e.*, h.name AS creator_household_name
             FROM events e
             JOIN households h ON h.id = e.creator_household_id
             WHERE e.id = ?
             LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(
        int $creatorHouseholdId,
        string $title,
        string $type,
        ?string $description,
        ?string $location,
        string $startsAt,
        ?string $endsAt,
        string $visibility
    ): int {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO events
                (creator_household_id, title, type, description, location, starts_at, ends_at, visibility, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            $creatorHouseholdId, $title, $type, $description, $location, $startsAt, $endsAt, $visibility,
        ]);
        return (int) Database::pdo()->lastInsertId();
    }
}
