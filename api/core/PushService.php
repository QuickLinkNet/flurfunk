<?php

namespace App\Core;

use App\Models\PushSubscription;

final class PushService
{
    public static function sendTestToUser(int $userId): array
    {
        return self::sendToSubscriptions(PushSubscription::findByUser($userId));
    }

    public static function sendFeedUpdate(int $authorUserId): array
    {
        return self::sendToSubscriptions(PushSubscription::findAllExceptUser($authorUserId));
    }

    public static function sendBroadcast(): array
    {
        return self::sendToSubscriptions(PushSubscription::findAll());
    }

    private static function sendToSubscriptions(array $subscriptions): array
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
            $status = WebPush::send($sub['endpoint']);
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
