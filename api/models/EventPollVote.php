<?php

namespace App\Models;

use App\Core\Database;

final class EventPollVote
{
    public static function upsert(int $optionId, int $householdId, string $response, int $userId): void
    {
        $pdo = Database::pdo();
        $update = $pdo->prepare(
            'UPDATE event_poll_votes SET response = ?, voted_by_user_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE option_id = ? AND household_id = ?'
        );
        $update->execute([$response, $userId, $optionId, $householdId]);
        if ($update->rowCount() > 0) {
            return;
        }

        $existing = $pdo->prepare('SELECT id FROM event_poll_votes WHERE option_id = ? AND household_id = ? LIMIT 1');
        $existing->execute([$optionId, $householdId]);
        if ($existing->fetch()) {
            return;
        }

        $insert = $pdo->prepare(
            'INSERT INTO event_poll_votes (option_id, household_id, response, voted_by_user_id, updated_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $insert->execute([$optionId, $householdId, $response, $userId]);
    }

    public static function findForHousehold(int $pollId, int $householdId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT v.* FROM event_poll_votes v
             JOIN event_poll_options o ON o.id = v.option_id
             WHERE o.poll_id = ? AND v.household_id = ?'
        );
        $stmt->execute([$pollId, $householdId]);
        return $stmt->fetchAll();
    }
}
