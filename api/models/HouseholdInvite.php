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

    public static function create(int $householdId, string $firstName, string $lastName, ?string $email = null): array
    {
        $pdo = Database::pdo();
        // Kollision bei 33^8 möglichen Codes praktisch ausgeschlossen, Retry
        // nur als Sicherheitsnetz.
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $code = self::generateCode();
            $stmt = $pdo->prepare(
                'INSERT OR IGNORE INTO household_invites (household_id, code, first_name, last_name, email, created_at)
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
            );
            $stmt->execute([$householdId, $code, $firstName, $lastName, $email]);
            if ($stmt->rowCount() > 0) {
                $invite = self::findById((int) $pdo->lastInsertId());
                if ($invite !== null) {
                    return $invite;
                }
            }
        }
        throw new \RuntimeException('Konnte keinen eindeutigen Einladungscode generieren.');
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT hi.*, u.id AS used_user_id, u.email AS used_user_email, u.display_name AS used_user_display_name,
                    u.onboarding_completed_at AS used_user_onboarding_completed_at,
                    u.onboarding_current_step AS used_user_onboarding_current_step
             FROM household_invites hi
             LEFT JOIN users u ON u.id = hi.used_by_user_id
             WHERE hi.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByCode(string $code): ?array
    {
        $code = strtoupper(preg_replace('/\s+/', '', $code));
        $stmt = Database::pdo()->prepare('SELECT * FROM household_invites WHERE code = ? LIMIT 1');
        $stmt->execute([$code]);
        return $stmt->fetch() ?: null;
    }

    public static function findByHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT hi.*, u.id AS used_user_id, u.email AS used_user_email, u.display_name AS used_user_display_name,
                    u.onboarding_completed_at AS used_user_onboarding_completed_at,
                    u.onboarding_current_step AS used_user_onboarding_current_step
             FROM household_invites hi
             LEFT JOIN users u ON u.id = hi.used_by_user_id
             WHERE hi.household_id = ?
             ORDER BY hi.created_at'
        );
        $stmt->execute([$householdId]);
        return $stmt->fetchAll();
    }

    public static function markUsed(int $inviteId, int $userId): bool
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE household_invites
             SET used_at = CURRENT_TIMESTAMP, used_by_user_id = ?
             WHERE id = ? AND used_at IS NULL AND revoked_at IS NULL'
        );
        $stmt->execute([$userId, $inviteId]);
        return $stmt->rowCount() === 1;
    }

    public static function revoke(int $inviteId): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE household_invites SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND used_at IS NULL'
        );
        $stmt->execute([$inviteId]);
    }

    public static function markEmailSent(int $inviteId): array
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE household_invites
             SET email_sent_at = COALESCE(email_sent_at, CURRENT_TIMESTAMP),
                 email_last_sent_at = CURRENT_TIMESTAMP,
                 email_send_count = COALESCE(email_send_count, 0) + 1
             WHERE id = ?'
        );
        $stmt->execute([$inviteId]);
        return self::findById($inviteId) ?? throw new \RuntimeException('Einladung nicht gefunden.');
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
