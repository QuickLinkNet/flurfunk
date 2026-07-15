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
               AND ((e.ends_at IS NULL AND e.starts_at >= ?) OR (e.ends_at IS NOT NULL AND e.ends_at >= ?))
             GROUP BY e.id
             ORDER BY e.starts_at ASC
             LIMIT ?"
        );
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $stmt->execute([...$allowed, $now, $now, $limit]);
        return $stmt->fetchAll();
    }

    public static function findInRange(string $from, string $to, ?string $viewerRole): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT e.*, h.name AS creator_household_name
             FROM events e
             JOIN households h ON h.id = e.creator_household_id
             WHERE e.visibility IN ($placeholders)
               AND e.starts_at < ? AND (e.ends_at IS NULL OR e.ends_at >= ?)
             ORDER BY e.starts_at"
        );
        $stmt->execute([...$allowed, $to, $from]);
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

    public static function update(
        int $id,
        string $title,
        string $type,
        ?string $description,
        ?string $location,
        string $startsAt,
        ?string $endsAt,
        string $visibility
    ): void {
        $stmt = Database::pdo()->prepare(
            'UPDATE events
             SET title = ?, type = ?, description = ?, location = ?, starts_at = ?, ends_at = ?, visibility = ?
             WHERE id = ?'
        );
        $stmt->execute([$title, $type, $description, $location, $startsAt, $endsAt, $visibility, $id]);
    }

    // Admin-Ansicht: alle Events unabhängig von Sichtbarkeit, inkl. RSVP-Zählern.
    public static function findAll(int $limit = 100): array
    {
        $stmt = Database::pdo()->prepare(
            "SELECT e.*, h.name AS creator_household_name,
                SUM(CASE WHEN er.response = 'yes' THEN 1 ELSE 0 END) AS yes_count,
                SUM(CASE WHEN er.response = 'maybe' THEN 1 ELSE 0 END) AS maybe_count,
                SUM(CASE WHEN er.response = 'no' THEN 1 ELSE 0 END) AS no_count
             FROM events e
             JOIN households h ON h.id = e.creator_household_id
             LEFT JOIN event_responses er ON er.event_id = e.id
             GROUP BY e.id
             ORDER BY e.starts_at DESC
             LIMIT ?"
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    public static function delete(int $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM events WHERE id = ?');
        $stmt->execute([$id]);
    }
}
