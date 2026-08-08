<?php

namespace App\Core;

use App\Models\PushSubscription;

final class PushService
{
    public static function sendTestToUser(int $userId, ?array $payload = null): array
    {
        return self::sendToSubscriptions(PushSubscription::findByUser($userId), $payload);
    }

    public static function sendFeedUpdate(int $authorUserId, ?array $payload = null): array
    {
        return self::sendToSubscriptions(PushSubscription::findAllExceptUser($authorUserId), $payload);
    }

    public static function sendBroadcast(?array $payload = null): array
    {
        return self::sendToSubscriptions(PushSubscription::findAll(), $payload);
    }

    public static function sendToAdmins(int $excludeUserId, ?array $payload = null): array
    {
        return self::sendToSubscriptions(PushSubscription::findAdmins($excludeUserId), $payload);
    }

    public static function sendEventReminder(int $eventId, int $excludeUserId, ?array $payload = null): array
    {
        return self::sendToSubscriptions(PushSubscription::findForEventNonResponders($eventId, $excludeUserId), $payload);
    }

    private static function sendToSubscriptions(array $subscriptions, ?array $payload): array
    {
        if (count($subscriptions) === 0) {
            return [
                'sent' => 0,
                'total' => 0,
                'removed' => 0,
                'failed' => 0,
                'statuses' => [],
            ];
        }

        $sent = 0;
        $removed = 0;
        $failed = 0;
        $statuses = [];
        foreach ($subscriptions as $sub) {
            $status = WebPush::send($sub, $payload);
            $statuses[] = $status;
            if ($status === 404 || $status === 410) {
                PushSubscription::deleteByEndpoint($sub['endpoint']);
                $removed++;
                continue;
            }
            if ($status >= 200 && $status < 300) {
                $sent++;
                continue;
            }
            $failed++;
        }

        return [
            'sent' => $sent,
            'total' => count($subscriptions),
            'removed' => $removed,
            'failed' => $failed,
            'statuses' => $statuses,
        ];
    }
}
