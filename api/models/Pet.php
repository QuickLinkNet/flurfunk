<?php

namespace App\Models;

use App\Core\Database;

final class Pet
{
    public const TYPES = ['dog', 'cat', 'other'];

    public static function findByHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM pets WHERE household_id = ? ORDER BY name');
        $stmt->execute([$householdId]);
        return $stmt->fetchAll();
    }

    public static function create(int $householdId, string $name, string $type): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO pets (household_id, name, type) VALUES (?, ?, ?)'
        );
        $stmt->execute([$householdId, $name, $type]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function belongsToHousehold(int $petId, int $householdId): bool
    {
        $stmt = Database::pdo()->prepare('SELECT 1 FROM pets WHERE id = ? AND household_id = ?');
        $stmt->execute([$petId, $householdId]);
        return (bool) $stmt->fetchColumn();
    }

    public static function delete(int $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM pets WHERE id = ?');
        $stmt->execute([$id]);
    }

    public static function update(int $id, string $name, string $type): void
    {
        $stmt = Database::pdo()->prepare('UPDATE pets SET name = ?, type = ? WHERE id = ?');
        $stmt->execute([$name, $type, $id]);
    }
}
