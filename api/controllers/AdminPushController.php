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

        Response::json(PushService::sendTestToUser($userId) + ['userId' => $userId]);
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
