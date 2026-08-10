<?php

namespace App\Models;

use App\Core\Database;

final class PushSubscription
{
    public static function subscribe(int $userId, string $endpoint, string $p256dh, string $auth): void
    {
        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $pdo->prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')->execute([$endpoint]);
            $stmt = $pdo->prepare(
                'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
            );
            $stmt->execute([$userId, $endpoint, $p256dh, $auth]);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public static function unsubscribe(int $userId, string $endpoint): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?');
        $stmt->execute([$userId, $endpoint]);
    }

    public static function findByUser(int $userId): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM push_subscriptions WHERE user_id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function findAllExceptUser(int $userId): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM push_subscriptions WHERE user_id != ?');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function findAll(): array
    {
        return Database::pdo()->query('SELECT * FROM push_subscriptions')->fetchAll();
    }

    public static function findAdmins(int $excludeUserId): array
    {
        $stmt = Database::pdo()->prepare(
            "SELECT ps.* FROM push_subscriptions ps
             JOIN users u ON u.id = ps.user_id
             WHERE u.role = 'admin' AND u.id != ?"
        );
        $stmt->execute([$excludeUserId]);
        return $stmt->fetchAll();
    }

    // Für Event-Erinnerungen: Nutzer, deren Haushalt noch gar nicht auf das
    // Event reagiert hat (kein event_responses-Eintrag) - das ist der
    // haeufigste Fall von "Zusage vergessen", nicht "Vielleicht" o.ae.
    public static function findForEventNonResponders(int $eventId, int $excludeUserId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT ps.*, u.household_id AS reminder_household_id
             FROM push_subscriptions ps
             JOIN users u ON u.id = ps.user_id
             WHERE ps.user_id != ?
               AND (u.household_id IS NULL OR u.household_id NOT IN (
                 SELECT household_id FROM event_responses WHERE event_id = ?
               ))'
        );
        $stmt->execute([$excludeUserId, $eventId]);
        return $stmt->fetchAll();
    }

    public static function findByHouseholdExceptUser(int $householdId, int $excludeUserId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT ps.* FROM push_subscriptions ps
             JOIN users u ON u.id = ps.user_id
             WHERE u.household_id = ? AND u.id != ?'
        );
        $stmt->execute([$householdId, $excludeUserId]);
        return $stmt->fetchAll();
    }

    public static function hasAny(int $userId): bool
    {
        $stmt = Database::pdo()->prepare('SELECT 1 FROM push_subscriptions WHERE user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        return (bool) $stmt->fetchColumn();
    }

    public static function deleteByEndpoint(string $endpoint): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM push_subscriptions WHERE endpoint = ?');
        $stmt->execute([$endpoint]);
    }
}
