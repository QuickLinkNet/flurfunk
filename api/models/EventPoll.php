<?php

namespace App\Models;

use App\Core\Database;

final class EventPoll
{
    public static function findUpcoming(?string $viewerRole, int $limit = 50): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT p.*, h.name AS creator_household_name
             FROM event_polls p
             JOIN households h ON h.id = p.creator_household_id
             WHERE p.visibility IN ($placeholders)
             ORDER BY p.status ASC, p.created_at DESC
             LIMIT ?"
        );
        $stmt->execute([...$allowed, $limit]);
        return $stmt->fetchAll();
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT p.*, h.name AS creator_household_name
             FROM event_polls p
             JOIN households h ON h.id = p.creator_household_id
             WHERE p.id = ?
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
        string $visibility
    ): int {
        $stmt = Database::pdo()->prepare(
            "INSERT INTO event_polls (creator_household_id, title, type, description, location, visibility, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)"
        );
        $stmt->execute([$creatorHouseholdId, $title, $type, $description, $location, $visibility]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function update(
        int $id,
        string $title,
        string $type,
        ?string $description,
        ?string $location,
        string $visibility
    ): void {
        $stmt = Database::pdo()->prepare(
            'UPDATE event_polls SET title = ?, type = ?, description = ?, location = ?, visibility = ? WHERE id = ?'
        );
        $stmt->execute([$title, $type, $description, $location, $visibility, $id]);
    }

    public static function close(int $id, int $resultingEventId): void
    {
        $stmt = Database::pdo()->prepare("UPDATE event_polls SET status = 'closed', resulting_event_id = ? WHERE id = ?");
        $stmt->execute([$resultingEventId, $id]);
    }

    public static function delete(int $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM event_polls WHERE id = ?');
        $stmt->execute([$id]);
    }
}
