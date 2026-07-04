<?php

namespace App\Models;

use App\Core\Database;

final class Child
{
    public static function findByHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM children WHERE household_id = ? ORDER BY name');
        $stmt->execute([$householdId]);
        return $stmt->fetchAll();
    }

    public static function create(int $householdId, string $name, ?string $birthdate): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO children (household_id, name, birthdate, current_location, updated_at)
             VALUES (?, ?, ?, "both", NOW())'
        );
        $stmt->execute([$householdId, $name, $birthdate]);
        return (int) Database::pdo()->lastInsertId();
    }

    // Prüft Besitz vor jeder Änderung, damit niemand fremde Kinder editiert.
    public static function belongsToHousehold(int $childId, int $householdId): bool
    {
        $stmt = Database::pdo()->prepare('SELECT 1 FROM children WHERE id = ? AND household_id = ?');
        $stmt->execute([$childId, $householdId]);
        return (bool) $stmt->fetchColumn();
    }

    public static function updateLocation(int $childId, string $location, ?string $note): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE children SET current_location = ?, location_note = ?, updated_at = NOW() WHERE id = ?'
        );
        $stmt->execute([$location, $note, $childId]);
    }
}
