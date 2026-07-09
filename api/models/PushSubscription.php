<?php

namespace App\Models;

use App\Core\Database;

final class PushSubscription
{
    public static function subscribe(int $userId, string $endpoint, string $p256dh, string $auth): void
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(endpoint) DO UPDATE SET
                user_id = excluded.user_id,
                p256dh = excluded.p256dh,
                auth = excluded.auth'
        );
        $stmt->execute([$userId, $endpoint, $p256dh, $auth]);
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
