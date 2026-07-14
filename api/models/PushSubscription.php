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
