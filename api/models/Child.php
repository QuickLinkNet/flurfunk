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

    // Für die Dashboard-"Heute Geburtstag"-Ansicht. Kinder-Geburtstage sind
    // bewusst für alle Nachbarn sichtbar (NICHT über die "children"-
    // Sichtbarkeit gefiltert) - sonst hat das Feature keinen Mehrwert für die
    // Nachbarschaft. Nur Name + Datum, keine Standort-Infos.
    public static function todaysBirthdays(): array
    {
        $stmt = Database::pdo()->prepare(
            "SELECT c.name AS name, c.birthdate AS birthday, h.name AS household_name
             FROM children c
             JOIN households h ON h.id = c.household_id
             WHERE c.birthdate IS NOT NULL
               AND strftime('%m-%d', c.birthdate) = ?
             ORDER BY c.name"
        );
        $stmt->execute([date('m-d')]);
        return $stmt->fetchAll();
    }

    // Alle Kinder mit Geburtsdatum - für die synthetischen Geburtstags-
    // Einträge im Kalender (CalendarController::birthdayItems).
    public static function withBirthday(): array
    {
        return Database::pdo()->query(
            'SELECT c.id, c.name AS name, c.birthdate AS birthday, h.name AS household_name, h.avatar_key AS household_avatar_key
             FROM children c
             JOIN households h ON h.id = c.household_id
             WHERE c.birthdate IS NOT NULL'
        )->fetchAll();
    }
}
