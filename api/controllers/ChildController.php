<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\Child;
use App\Models\User;

final class ChildController
{
    public function index(): void
    {
        $householdId = $this->requireHouseholdId();
        Response::json(array_map([$this, 'toPublicChild'], Child::findByHousehold($householdId)));
    }

    public function store(): void
    {
        $householdId = $this->requireHouseholdId();
        $body = Request::json();
        $name = trim($body['name'] ?? '');
        if ($name === '') {
            Response::error('Name des Kindes fehlt.', 422);
        }
        $id = Child::create($householdId, $name, $body['birthdate'] ?? null);
        Response::json(['id' => $id], 201);
    }

    public function updateLocation(array $params): void
    {
        $householdId = $this->requireHouseholdId();
        $childId = (int) $params['id'];
        if (!Child::belongsToHousehold($childId, $householdId)) {
            Response::error('Kind gehört nicht zu deinem Haushalt.', 403);
        }
        $body = Request::json();
        $allowed = ['mama', 'papa', 'both', 'grandparents', 'friends', 'vacation', 'school', 'kindergarten', 'other'];
        $location = $body['location'] ?? '';
        if (!in_array($location, $allowed, true)) {
            Response::error('Ungültiger Aufenthaltsort.', 422);
        }
        Child::updateLocation($childId, $location, $body['note'] ?? null);
        Response::json(null);
    }

    private function requireHouseholdId(): int
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        return (int) $user['household_id'];
    }

    private function toPublicChild(array $c): array
    {
        return [
            'id' => (int) $c['id'],
            'name' => $c['name'],
            'birthdate' => $c['birthdate'],
            'currentLocation' => $c['current_location'],
            'locationNote' => $c['location_note'],
            'updatedAt' => $c['updated_at'],
        ];
    }
}
