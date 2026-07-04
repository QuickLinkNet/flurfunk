<?php

namespace App\Models;

use App\Core\Database;

final class User
{
    public static function findByEmail(string $email): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(string $email, string $passwordHash, string $displayName, int $streetId): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO users (email, password_hash, display_name, role, created_at)
             VALUES (?, ?, ?, "member", NOW())'
        );
        $stmt->execute([$email, $passwordHash, $displayName]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function attachHousehold(int $userId, int $householdId): void
    {
        $stmt = Database::pdo()->prepare('UPDATE users SET household_id = ? WHERE id = ?');
        $stmt->execute([$householdId, $userId]);
    }
}
