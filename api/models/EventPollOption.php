<?php

namespace App\Models;

use App\Core\Database;

final class EventPollOption
{
    public static function createMany(int $pollId, array $startsAtList): void
    {
        $stmt = Database::pdo()->prepare('INSERT INTO event_poll_options (poll_id, starts_at) VALUES (?, ?)');
        foreach ($startsAtList as $startsAt) {
            $stmt->execute([$pollId, $startsAt]);
        }
    }

    public static function findByPoll(int $pollId): array
    {
        $stmt = Database::pdo()->prepare(
            "SELECT o.*,
                SUM(CASE WHEN v.response = 'yes' THEN 1 ELSE 0 END) AS yes_count,
                SUM(CASE WHEN v.response = 'maybe' THEN 1 ELSE 0 END) AS maybe_count,
                SUM(CASE WHEN v.response = 'no' THEN 1 ELSE 0 END) AS no_count
             FROM event_poll_options o
             LEFT JOIN event_poll_votes v ON v.option_id = o.id
             WHERE o.poll_id = ?
             GROUP BY o.id
             ORDER BY o.starts_at ASC"
        );
        $stmt->execute([$pollId]);
        return $stmt->fetchAll();
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM event_poll_options WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }
}
