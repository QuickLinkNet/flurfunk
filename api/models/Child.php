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
             VALUES (?, ?, ?, "both", CURRENT_TIMESTAMP)'
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
            'UPDATE children SET current_location = ?, location_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        $stmt->execute([$location, $note, $childId]);
    }

    public static function updateName(int $childId, string $name): void
    {
        $stmt = Database::pdo()->prepare('UPDATE children SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$name, $childId]);
    }

    public static function delete(int $childId): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM children WHERE id = ?');
        $stmt->execute([$childId]);
    }

    // Für die Dashboard-"Heute Geburtstag"-Ansicht - nur Monat/Tag ausgewertet,
    // Geburtsjahr bleibt privat. Respektiert die "children"-Sichtbarkeit des
    // Haushalts wie die Nachbarn-Ansicht (siehe HouseholdController).
    public static function todaysBirthdays(): array
    {
        $stmt = Database::pdo()->prepare(
            "SELECT c.name AS name, h.name AS household_name
             FROM children c
             JOIN households h ON h.id = c.household_id
             LEFT JOIN household_visibility_settings v ON v.household_id = h.id AND v.field_key = 'children'
             WHERE c.birthdate IS NOT NULL
               AND CAST(strftime('%m', c.birthdate) AS INTEGER) = ?
               AND CAST(strftime('%d', c.birthdate) AS INTEGER) = ?
               AND COALESCE(v.visibility, 'neighbors') != 'private'
             ORDER BY c.name"
        );
        $stmt->execute([(int) date('n'), (int) date('j')]);
        return $stmt->fetchAll();
    }
}
