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
             SET status_emoji = ?, status_label = ?, status_note = ?, status_updated_at = CURRENT_TIMESTAMP
             WHERE id = ?'
        );
        $stmt->execute([$emoji, $label, $note, $householdId]);
    }

    public static function updateDetails(int $householdId, string $name, string $addressLine, string $avatarKey): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE households SET name = ?, address_line = ?, avatar_key = ? WHERE id = ?'
        );
        $stmt->execute([$name, $addressLine, $avatarKey, $householdId]);
    }

    public static function updateContactNote(int $householdId, ?string $contactNote): void
    {
        $stmt = Database::pdo()->prepare('UPDATE households SET contact_note = ? WHERE id = ?');
        $stmt->execute([$contactNote, $householdId]);
    }

    // Duplikat-Schutz fuer den selbstbedienten Einladungslink: Name ODER
    // Adresse identisch (ohne Gross-/Kleinschreibung, ohne Leerraum) gilt als
    // "diese Familie gibt es schon" - verhindert, dass sich ein Haushalt aus
    // Versehen zweimal als eigene "Familie" anlegt, statt beizutreten.
    public static function findByNormalizedNameOrAddress(int $streetId, string $name, string $addressLine): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM households
             WHERE street_id = ?
               AND (LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(address_line)) = LOWER(TRIM(?)))
             LIMIT 1'
        );
        $stmt->execute([$streetId, $name, $addressLine]);
        return $stmt->fetch() ?: null;
    }

    public static function create(int $streetId, string $name, string $addressLine): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO households (street_id, name, address_line, status_emoji, status_label, created_at)
             VALUES (?, ?, ?, "🏠", "Zuhause", CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$streetId, $name, $addressLine]);
        return (int) Database::pdo()->lastInsertId();
    }

    // Admin-Ansicht: alle Haushalte unabhängig von Sichtbarkeits-Einstellungen.
    public static function findAll(): array
    {
        $stmt = Database::pdo()->query(
            'SELECT h.*, s.name AS street_name FROM households h
             JOIN streets s ON s.id = h.street_id
             ORDER BY h.name'
        );
        return $stmt->fetchAll();
    }

    // Löscht den Haushalt vollständig. Mitglieder ohne Admin-Rolle werden mitgelöscht
    // (sonst blieben verwaiste Nutzerkonten ohne Haushalt zurück). Admin-Accounts werden
    // nur vom Haushalt gelöst, nie automatisch gelöscht, damit ein Haushalt-Löschen nie
    // versehentlich einen Admin-Zugang entfernen kann.
    public static function delete(int $id): void
    {
        $pdo = Database::pdo();

        $pdo->beginTransaction();
        try {
            $memberStmt = $pdo->prepare("SELECT id FROM users WHERE household_id = ? AND role != 'admin'");
            $memberStmt->execute([$id]);
            $memberUserIds = array_map('intval', $memberStmt->fetchAll(\PDO::FETCH_COLUMN));

            $pdo->prepare('DELETE FROM feed_reactions WHERE user_id IN (SELECT id FROM users WHERE household_id = ?)')->execute([$id]);
            $pdo->prepare("UPDATE users SET household_id = NULL WHERE household_id = ? AND role = 'admin'")->execute([$id]);

            foreach ($memberUserIds as $userId) {
                $pdo->prepare('DELETE FROM feed_comments WHERE user_id = ?')->execute([$userId]);
                $pdo->prepare('DELETE FROM feed_helpers WHERE user_id = ?')->execute([$userId]);
                $pdo->prepare('DELETE FROM feed_loans WHERE user_id = ?')->execute([$userId]);
                $pdo->prepare('DELETE FROM event_responses WHERE responded_by_user_id = ?')->execute([$userId]);
                $pdo->prepare('DELETE FROM notifications WHERE user_id = ?')->execute([$userId]);
                $pdo->prepare('DELETE FROM push_subscriptions WHERE user_id = ?')->execute([$userId]);
                $pdo->prepare('UPDATE household_invites SET used_by_user_id = NULL WHERE used_by_user_id = ?')->execute([$userId]);
            }
            if ($memberUserIds !== []) {
                $placeholders = implode(',', array_fill(0, count($memberUserIds), '?'));
                $pdo->prepare("DELETE FROM users WHERE id IN ($placeholders)")->execute($memberUserIds);
            }

            $pdo->prepare('DELETE FROM household_invites WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM children WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM pets WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM household_visibility_settings WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_comments WHERE feed_item_id IN (SELECT id FROM feed_items WHERE household_id = ?)')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_reactions WHERE feed_item_id IN (SELECT id FROM feed_items WHERE household_id = ?)')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_helpers WHERE feed_item_id IN (SELECT id FROM feed_items WHERE household_id = ?)')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_loans WHERE feed_item_id IN (SELECT id FROM feed_items WHERE household_id = ?)')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_comments WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_items WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM event_responses WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM event_responses WHERE event_id IN (SELECT id FROM events WHERE creator_household_id = ?)')->execute([$id]);
            $pdo->prepare('DELETE FROM events WHERE creator_household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM calendar_entries WHERE household_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM households WHERE id = ?')->execute([$id]);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }
}
