<?php

namespace App\Models;

use App\Core\Database;

final class EventResponse
{
    public static function findByEvent(int $eventId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT er.*, h.name AS household_name
             FROM event_responses er
             JOIN households h ON h.id = er.household_id
             WHERE er.event_id = ?
             ORDER BY er.updated_at DESC'
        );
        $stmt->execute([$eventId]);
        return $stmt->fetchAll();
    }

    public static function upsert(
        int $eventId,
        int $householdId,
        string $response,
        ?int $adultsCount,
        ?int $childrenCount,
        ?string $note,
        int $respondedByUserId
    ): void {
        $pdo = Database::pdo();
        $update = $pdo->prepare(
            'UPDATE event_responses
             SET response = ?, adults_count = ?, children_count = ?, note = ?, responded_by_user_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE event_id = ? AND household_id = ?'
        );
        $update->execute([
            $response, $adultsCount, $childrenCount, $note, $respondedByUserId, $eventId, $householdId,
        ]);
        if ($update->rowCount() > 0) {
            return;
        }

        $existing = $pdo->prepare('SELECT id FROM event_responses WHERE event_id = ? AND household_id = ? LIMIT 1');
        $existing->execute([$eventId, $householdId]);
        if ($existing->fetch()) {
            return;
        }

        $insert = $pdo->prepare(
            'INSERT INTO event_responses
                (event_id, household_id, response, adults_count, children_count, note, responded_by_user_id, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $insert->execute([
            $eventId, $householdId, $response, $adultsCount, $childrenCount, $note, $respondedByUserId,
        ]);
    }
}
