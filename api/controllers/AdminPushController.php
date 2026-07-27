<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Response;
use App\Models\User;

final class AdminPushController
{
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
