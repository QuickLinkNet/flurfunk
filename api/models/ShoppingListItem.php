<?php

namespace App\Models;

use App\Core\Database;

// Private Einkaufsliste pro Haushalt (wie Kinder/Haustiere) - nicht fuer die
// Nachbarschaft sichtbar. Kein Abgleich mit Rezepten (das ist der spaeter
// geplante, groessere "Vorrat"-Teil).
final class ShoppingListItem
{
    public static function findByHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM shopping_list_items WHERE household_id = ? ORDER BY is_done ASC, created_at ASC'
        );
        $stmt->execute([$householdId]);
        return $stmt->fetchAll();
    }

    public static function create(int $householdId, string $label, ?string $quantity): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO shopping_list_items (household_id, label, quantity, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$householdId, $label, $quantity]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function belongsToHousehold(int $itemId, int $householdId): bool
    {
        $stmt = Database::pdo()->prepare('SELECT 1 FROM shopping_list_items WHERE id = ? AND household_id = ?');
        $stmt->execute([$itemId, $householdId]);
        return (bool) $stmt->fetchColumn();
    }

    public static function updateDone(int $itemId, bool $isDone): void
    {
        $stmt = Database::pdo()->prepare('UPDATE shopping_list_items SET is_done = ? WHERE id = ?');
        $stmt->execute([$isDone ? 1 : 0, $itemId]);
    }

    public static function delete(int $itemId): void
    {
        Database::pdo()->prepare('DELETE FROM shopping_list_items WHERE id = ?')->execute([$itemId]);
    }

    public static function deleteDoneForHousehold(int $householdId): void
    {
        Database::pdo()->prepare('DELETE FROM shopping_list_items WHERE household_id = ? AND is_done = 1')->execute([$householdId]);
    }
}
