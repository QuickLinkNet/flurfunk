<?php

namespace App\Models;

use App\Core\Database;

final class Household
{
    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM households WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    // Liefert alle Haushalte, deren Status-Feld für den anfragenden
    // User sichtbar ist (public immer, neighbors nur für angemeldete
    // Mitglieder, private nie). Sichtbarkeitslogik lebt bewusst hier
    // im Model, nicht im Controller oder gar im Frontend.
    public static function findVisibleFor(?string $viewerRole): array
    {
        $allowed = $viewerRole === 'guest' ? ['public'] : ['public', 'neighbors'];
        $placeholders = implode(',', array_fill(0, count($allowed), '?'));
        $stmt = Database::pdo()->prepare(
            "SELECT h.* FROM households h
             LEFT JOIN household_visibility_settings v
               ON v.household_id = h.id AND v.field_key = 'status'
             WHERE COALESCE(v.visibility, 'neighbors') IN ($placeholders)
             ORDER BY h.name"
        );
        $stmt->execute($allowed);
        return $stmt->fetchAll();
    }

    public static function updateStatus(int $householdId, string $emoji, string $label, ?string $note): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE households
             SET status_emoji = ?, status_label = ?, status_note = ?, status_updated_at = NOW()
             WHERE id = ?'
        );
        $stmt->execute([$emoji, $label, $note, $householdId]);
    }
}
