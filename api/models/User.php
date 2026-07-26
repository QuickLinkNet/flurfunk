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
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
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

    public static function adminCount(): int
    {
        $stmt = Database::pdo()->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        return (int) $stmt->fetchColumn();
    }

    public static function findByHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM users WHERE household_id = ? ORDER BY display_name');
        $stmt->execute([$householdId]);
        return $stmt->fetchAll();
    }

    // Admin-Ansicht: alle Nutzer inkl. Haushaltsname (falls zugeordnet).
    public static function findAll(): array
    {
        $stmt = Database::pdo()->query(
            'SELECT u.*, h.name AS household_name FROM users u
             LEFT JOIN households h ON h.id = u.household_id
             ORDER BY u.display_name'
        );
        return $stmt->fetchAll();
    }

    public static function updateRole(int $id, string $role): void
    {
        $stmt = Database::pdo()->prepare('UPDATE users SET role = ? WHERE id = ?');
        $stmt->execute([$role, $id]);
    }

    public static function updateProfile(int $id, string $displayName, ?string $avatarUrl): void
    {
        $stmt = Database::pdo()->prepare('UPDATE users SET display_name = ?, avatar_url = ? WHERE id = ?');
        $stmt->execute([$displayName, $avatarUrl, $id]);
    }

    public static function updatePassword(int $id, string $passwordHash): void
    {
        $stmt = Database::pdo()->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        $stmt->execute([$passwordHash, $id]);
    }

    public static function updateDigestPreference(int $id, bool $enabled): void
    {
        $stmt = Database::pdo()->prepare('UPDATE users SET weekly_digest_enabled = ? WHERE id = ?');
        $stmt->execute([$enabled ? 1 : 0, $id]);
    }

    public static function delete(int $id): void
    {
        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $pdo->prepare('DELETE FROM feed_reactions WHERE user_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_comments WHERE user_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM feed_helpers WHERE user_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM event_responses WHERE responded_by_user_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM notifications WHERE user_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM push_subscriptions WHERE user_id = ?')->execute([$id]);
            $pdo->prepare('UPDATE household_invites SET used_by_user_id = NULL WHERE used_by_user_id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    public static function completeOnboarding(int $id): void
    {
        $stmt = Database::pdo()->prepare(
            "UPDATE users SET onboarding_completed_at = CURRENT_TIMESTAMP, onboarding_current_step = 'push' WHERE id = ?"
        );
        $stmt->execute([$id]);
    }

    public static function updateOnboardingProgress(int $id, string $step): void
    {
        $stmt = Database::pdo()->prepare('UPDATE users SET onboarding_current_step = ? WHERE id = ?');
        $stmt->execute([$step, $id]);
    }
}
