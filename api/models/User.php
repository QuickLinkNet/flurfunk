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

    public static function create(string $email, string $passwordHash, string $displayName, string $role = 'member'): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO users (email, password_hash, display_name, role, created_at)
             VALUES (?, ?, ?, ?, NOW())'
        );
        $stmt->execute([$email, $passwordHash, $displayName, $role]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function attachHousehold(int $userId, int $householdId): void
    {
        $stmt = Database::pdo()->prepare('UPDATE users SET household_id = ? WHERE id = ?');
        $stmt->execute([$householdId, $userId]);
    }

    // Der erste registrierte Nutzer einer Straße wird automatisch Admin,
    // da es sonst keinen Weg gäbe, überhaupt einen Admin zu bekommen
    // (Admin-Bereich ist laut PRD erst v2.0, bis dahin reicht direkter DB-Zugriff).
    public static function adminExists(): bool
    {
        $stmt = Database::pdo()->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        return ((int) $stmt->fetchColumn()) > 0;
    }
}
