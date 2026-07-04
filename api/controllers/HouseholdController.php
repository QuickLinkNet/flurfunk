<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\Household;
use App\Models\User;

final class HouseholdController
{
    public function index(): void
    {
        $userId = Auth::userId();
        $viewerRole = $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';
        $households = Household::findVisibleFor($viewerRole);
        Response::json(array_map([$this, 'toPublicHousehold'], $households));
    }

    public function me(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $household = Household::findById((int) $user['household_id']);
        Response::json($this->toPublicHousehold($household));
    }

    public function updateMe(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $body = Request::json();
        Household::updateStatus(
            (int) $user['household_id'],
            $body['statusEmoji'] ?? '🏠',
            $body['statusLabel'] ?? 'Zuhause',
            $body['statusNote'] ?? null
        );
        Response::json(Household::findById((int) $user['household_id']));
    }

    private function toPublicHousehold(array $h): array
    {
        return [
            'id' => (int) $h['id'],
            'name' => $h['name'],
            'addressLine' => $h['address_line'],
            'statusEmoji' => $h['status_emoji'],
            'statusLabel' => $h['status_label'],
            'statusNote' => $h['status_note'],
            'statusUpdatedAt' => $h['status_updated_at'],
        ];
    }
}
