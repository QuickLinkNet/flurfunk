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
        $stmt = Database::pdo()->prepare(
            'INSERT INTO event_responses
                (event_id, household_id, response, adults_count, children_count, note, responded_by_user_id, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
                response = VALUES(response),
                adults_count = VALUES(adults_count),
                children_count = VALUES(children_count),
                note = VALUES(note),
                responded_by_user_id = VALUES(responded_by_user_id),
                updated_at = NOW()'
        );
        $stmt->execute([
            $eventId, $householdId, $response, $adultsCount, $childrenCount, $note, $respondedByUserId,
        ]);
    }
}
