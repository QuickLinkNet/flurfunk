<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\Pet;
use App\Models\User;

final class PetController
{
    public function index(): void
    {
        $householdId = $this->requireHouseholdId();
        Response::json(array_map([$this, 'toPublicPet'], Pet::findByHousehold($householdId)));
    }

    public function store(): void
    {
        $householdId = $this->requireHouseholdId();
        $body = Request::json();
        $name = trim($body['name'] ?? '');
        if ($name === '') {
            Response::error('Name des Haustiers fehlt.', 422);
        }
        $type = in_array($body['type'] ?? '', Pet::TYPES, true) ? $body['type'] : 'other';
        $id = Pet::create($householdId, $name, $type);
        Response::json(['id' => $id], 201);
    }

    public function destroy(array $params): void
    {
        $householdId = $this->requireHouseholdId();
        $petId = (int) $params['id'];
        if (!Pet::belongsToHousehold($petId, $householdId)) {
            Response::error('Haustier gehört nicht zu deinem Haushalt.', 403);
        }
        Pet::delete($petId);
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

    private function toPublicPet(array $p): array
    {
        return [
            'id' => (int) $p['id'],
            'name' => $p['name'],
            'type' => $p['type'],
        ];
    }
}
