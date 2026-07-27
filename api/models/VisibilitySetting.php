<?php

namespace App\Models;

use App\Core\Database;

// Jeder Haushalt bestimmt selbst, was sichtbar ist (PRD Kapitel 5).
final class VisibilitySetting
{
    public const FIELDS = ['status', 'vacation', 'children_location', 'events', 'contact'];

    public static function findForHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT field_key, visibility FROM household_visibility_settings WHERE household_id = ?'
        );
        $stmt->execute([$householdId]);
        $rows = $stmt->fetchAll();

        $result = [];
        foreach (self::FIELDS as $field) {
            $result[$field] = 'neighbors'; // Default
        }
        foreach ($rows as $row) {
            $result[$row['field_key']] = $row['visibility'];
        }
        return $result;
    }

    public static function upsert(int $householdId, string $field, string $visibility): void
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO household_visibility_settings (household_id, field_key, visibility)
             VALUES (?, ?, ?)
             ON CONFLICT(household_id, field_key) DO UPDATE SET visibility = excluded.visibility'
        );
        $stmt->execute([$householdId, $field, $visibility]);
    }
}
