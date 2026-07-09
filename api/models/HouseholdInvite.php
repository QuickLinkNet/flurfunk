<?php

namespace App\Models;

use App\Core\Database;

// Personalisierter Einladungscode pro Person (löst den alten, einen
// Straßen-Einladungscode ab). Admin legt Haushalt + Personen an, jede
// Person bekommt einen eigenen, einmal einlösbaren Code.
final class HouseholdInvite
{
    private const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne 0/O/1/I/l
    private const CODE_LENGTH = 8;

    public static function create(int $householdId, string $firstName, string $lastName): array
    {
        $pdo = Database::pdo();
        // Kollision bei 33^8 möglichen Codes praktisch ausgeschlossen, Retry
        // nur als Sicherheitsnetz.
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $code = self::generateCode();
            $stmt = $pdo->prepare(
                'INSERT OR IGNORE INTO household_invites (household_id, code, first_name, last_name, created_at)
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
            );
            $stmt->execute([$householdId, $code, $firstName, $lastName]);
            if ($stmt->rowCount() > 0) {
                return self::findById((int) $pdo->lastInsertId());
            }
        }
        throw new \RuntimeException('Konnte keinen eindeutigen Einladungscode generieren.');
    }

    public static function findById(int $id): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM household_invites WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM household_invites WHERE code = ? LIMIT 1');
        $stmt->execute([$code]);
        return $stmt->fetch() ?: null;
    }

    public static function findByHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM household_invites WHERE household_id = ? ORDER BY created_at'
        );
        $stmt->execute([$householdId]);
        return $stmt->fetchAll();
    }

    public static function markUsed(int $inviteId, int $userId): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE household_invites SET used_at = CURRENT_TIMESTAMP, used_by_user_id = ? WHERE id = ?'
        );
        $stmt->execute([$userId, $inviteId]);
    }

    private static function generateCode(): string
    {
        $code = '';
        $max = strlen(self::CODE_ALPHABET) - 1;
        for ($i = 0; $i < self::CODE_LENGTH; $i++) {
            $code .= self::CODE_ALPHABET[random_int(0, $max)];
        }
        return $code;
    }
}
