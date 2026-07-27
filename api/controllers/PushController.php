<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\PushSubscription;
use App\Models\VapidKeys;

final class PushController
{
    public function vapidPublicKey(): void
    {
        Auth::requireLogin();
        Response::json(['publicKey' => VapidKeys::get()['public']]);
    }

    public function status(): void
    {
        $userId = Auth::requireLogin();
        Response::json(['subscribed' => PushSubscription::hasAny($userId)]);
    }

    public function subscribe(): void
    {
        $userId = Auth::requireLogin();
        $body = Request::json();
        $endpoint = trim($body['endpoint'] ?? '');
        $keys = $body['keys'] ?? [];
        $p256dh = trim($keys['p256dh'] ?? '');
        $auth = trim($keys['auth'] ?? '');
        if ($endpoint === '' || $p256dh === '' || $auth === '') {
            Response::error('Unvollständige Subscription.', 422);
        }
        PushSubscription::subscribe($userId, $endpoint, $p256dh, $auth);
        Response::json(null, 201);
    }

    public function unsubscribe(): void
    {
        $userId = Auth::requireLogin();
        $body = Request::json();
        $endpoint = trim($body['endpoint'] ?? '');
        if ($endpoint === '') {
            Response::error('Endpoint fehlt.', 422);
        }
        PushSubscription::unsubscribe($userId, $endpoint);
        Response::json(null);
    }

    public function test(): void
    {
        $userId = Auth::requireLogin();
        $result = PushService::sendTestToUser($userId, [
            'title' => 'Flurfunk: Test',
            'body' => 'Push-Benachrichtigungen funktionieren 🎉',
            'url' => '/apps/neighborhood/einstellungen',
        ]);
        if ($result['total'] === 0) {
            Response::error('Keine aktive Push-Anmeldung gefunden.', 404);
        }
        Response::json($result);
    }
}
