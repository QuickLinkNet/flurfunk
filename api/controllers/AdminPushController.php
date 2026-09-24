<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\User;

final class AdminPushController
{
    // Feature-Ankündigung als Push an alle Abonnenten - z.B. "Neu: Rezepte!"
    // mit direkter Verlinkung. Erreicht nur Nutzer mit aktivierten Push-
    // Benachrichtigungen (siehe Push-Opt-in), keine garantierte Zustellung
    // an wirklich jeden - dafür bräuchte es ein eigenes In-App-Postfach.
    public function sendBroadcast(): void
    {
        $this->requireAdmin();
        $body = Request::json();
        $title = trim((string) ($body['title'] ?? ''));
        $message = trim((string) ($body['body'] ?? ''));
        if ($title === '' || $message === '') {
            Response::error('Titel und Nachricht sind Pflicht.', 422);
        }

        $path = trim((string) ($body['path'] ?? ''));
        if ($path !== '' && !str_starts_with($path, '/')) {
            $path = '/' . $path;
        }
        $url = '/apps/neighborhood' . $path;

        $result = PushService::sendBroadcast([
            'title' => $title,
            'body' => $message,
            'url' => $url,
        ]);
        Response::json($result);
    }

    public function sendUserPushTest(array $params): void
    {
        $this->requireAdmin();
        $userId = (int) $params['id'];
        if (User::findById($userId) === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }

        $result = PushService::sendTestToUser($userId, [
            'title' => 'Flurfunk: Admin-Test',
            'body' => 'Test-Push vom Admin-Bereich.',
            'url' => '/apps/neighborhood/dashboard',
        ]);
        Response::json($result + ['userId' => $userId]);
    }

    private function requireAdmin(): int
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['role'] !== 'admin') {
            Response::error('Nur für Admins.', 403);
        }
        return $userId;
    }
}
