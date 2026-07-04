<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\User;
use App\Models\VisibilitySetting;

final class VisibilityController
{
    public function me(): void
    {
        $householdId = $this->requireHouseholdId();
        Response::json(VisibilitySetting::findForHousehold($householdId));
    }

    public function updateMe(): void
    {
        $householdId = $this->requireHouseholdId();
        $body = Request::json();
        $allowedVisibility = ['public', 'neighbors', 'private'];

        foreach ($body as $field => $visibility) {
            if (!in_array($field, VisibilitySetting::FIELDS, true)) {
                continue; // unbekannte Felder werden stillschweigend ignoriert
            }
            if (!in_array($visibility, $allowedVisibility, true)) {
                Response::error("Ungültiger Sichtbarkeitswert für '$field'.", 422);
            }
            VisibilitySetting::upsert($householdId, $field, $visibility);
        }
        Response::json(VisibilitySetting::findForHousehold($householdId));
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
}
