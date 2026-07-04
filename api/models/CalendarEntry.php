<?php

namespace App\Models;

use App\Core\Database;

final class CalendarEntry
{
    public static function findInRange(string $from, string $to, ?string $viewerRole): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT * FROM calendar_entries
             WHERE visibility IN ($placeholders)
               AND starts_at < ? AND (ends_at IS NULL OR ends_at >= ?)
             ORDER BY starts_at"
        );
        $stmt->execute([...$allowed, $to, $from]);
        return $stmt->fetchAll();
    }

    public static function create(
        string $type,
        int $householdId,
        string $title,
        string $startsAt,
        ?string $endsAt,
        bool $allDay,
        string $visibility
    ): int {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO calendar_entries (type, household_id, title, starts_at, ends_at, all_day, visibility)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$type, $householdId, $title, $startsAt, $endsAt, $allDay ? 1 : 0, $visibility]);
        return (int) Database::pdo()->lastInsertId();
    }
}
