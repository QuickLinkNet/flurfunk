<?php

namespace App\Models;

use App\Core\Database;

final class PasswordReset
{
    private const LIFETIME_SECONDS = 60 * 60; // 1 Stunde

    public static function create(int $userId): string
    {
        $pdo = Database::pdo();
        // Ältere, noch offene Tokens für diesen Nutzer entwerten, damit nur
        // der zuletzt verschickte Link funktioniert.
        $pdo->prepare('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL')
            ->execute([$userId]);

        $token = bin2hex(random_bytes(32));
        $expiresAt = gmdate('Y-m-d H:i:s', time() + self::LIFETIME_SECONDS);
        $stmt = $pdo->prepare(
            'INSERT INTO password_resets (user_id, token, expires_at, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$userId, $token, $expiresAt]);
        return $token;
    }

    public static function findValidByToken(string $token): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM password_resets WHERE token = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP LIMIT 1'
        );
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }

    public static function markUsed(int $id): void
    {
        $stmt = Database::pdo()->prepare('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$id]);
    }
}
