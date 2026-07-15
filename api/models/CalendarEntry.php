<?php

namespace App\Models;

use App\Core\Database;

final class CalendarEntry
{
    public const TYPES = ['vacation', 'birthday', 'event', 'visit', 'street_action', 'holiday', 'trash', 'appointment'];
    public const VISIBILITIES = ['public', 'neighbors', 'private'];

    public static function findInRange(string $from, string $to, ?string $viewerRole, ?int $viewerHouseholdId): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        if ($viewerRole === 'admin') {
            $allowed = ['public', 'neighbors', 'private'];
        }
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $ownerClause = $viewerHouseholdId !== null ? ' OR household_id = ?' : '';
        $params = [...$allowed];
        if ($viewerHouseholdId !== null) {
            $params[] = $viewerHouseholdId;
        }
        $params[] = $to;
        $params[] = $from;
        $stmt = Database::pdo()->prepare(
            "SELECT * FROM calendar_entries
             WHERE (visibility IN ($placeholders)$ownerClause)
               AND starts_at < ? AND (ends_at IS NULL OR ends_at >= ?)
             ORDER BY starts_at"
        );
        $stmt->execute($params);
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

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM calendar_entries WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function update(
        int $id,
        string $type,
        string $title,
        string $startsAt,
        ?string $endsAt,
        bool $allDay,
        string $visibility
    ): void {
        $stmt = Database::pdo()->prepare(
            'UPDATE calendar_entries
             SET type = ?, title = ?, starts_at = ?, ends_at = ?, all_day = ?, visibility = ?
             WHERE id = ?'
        );
        $stmt->execute([$type, $title, $startsAt, $endsAt, $allDay ? 1 : 0, $visibility, $id]);
    }

    // Admin-Ansicht: alle Kalendereinträge unabhängig von Sichtbarkeit/Zeitraum.
    public static function findAll(int $limit = 200): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM calendar_entries ORDER BY starts_at DESC LIMIT ?');
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    public static function delete(int $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM calendar_entries WHERE id = ?');
        $stmt->execute([$id]);
    }
}
