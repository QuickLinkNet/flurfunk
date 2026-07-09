<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\FeatureFlag;
use App\Models\Street;
use App\Models\User;

final class FeatureFlagController
{
    // Öffentlich lesbar: jeder Client (auch Gast) muss wissen, welche
    // Bereiche aktiv sind, um Navigation/Seiten entsprechend auszublenden.
    public function index(): void
    {
        Response::json(FeatureFlag::findForStreet($this->streetId()));
    }

    public function update(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['role'] !== 'admin') {
            Response::error('Nur für Admins.', 403);
        }
        $body = Request::json();
        foreach ($body as $feature => $enabled) {
            if (!in_array($feature, FeatureFlag::FEATURES, true)) {
                continue;
            }
            FeatureFlag::upsert($this->streetId(), $feature, (bool) $enabled);
        }
        Response::json(FeatureFlag::findForStreet($this->streetId()));
    }

    private function streetId(): int
    {
        $street = Street::first();
        if ($street === null) {
            Response::error('Keine Straße konfiguriert.', 500);
        }
        return (int) $street['id'];
    }
}
