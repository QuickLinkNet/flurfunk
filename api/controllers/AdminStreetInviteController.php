<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Models\Street;
use App\Models\User;

final class AdminStreetInviteController
{
    public function show(): void
    {
        $this->requireAdmin();
        Response::json(['token' => Street::ensurePublicInviteToken()]);
    }

    public function regenerate(): void
    {
        $this->requireAdmin();
        $street = Street::first();
        if ($street === null) {
            Response::error('Keine Straße konfiguriert.', 500);
        }
        Response::json(['token' => Street::regeneratePublicInviteToken((int) $street['id'])]);
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
