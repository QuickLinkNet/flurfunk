<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\ShoppingListItem;
use App\Models\User;

final class ShoppingListController
{
    public function index(): void
    {
        $householdId = $this->requireHouseholdId();
        Response::json(array_map([$this, 'toPublicItem'], ShoppingListItem::findByHousehold($householdId)));
    }

    public function store(): void
    {
        $householdId = $this->requireHouseholdId();
        $body = Request::json();
        $label = trim((string) ($body['label'] ?? ''));
        if ($label === '') {
            Response::error('Bitte einen Namen für den Artikel eingeben.', 422);
        }
        $quantity = trim((string) ($body['quantity'] ?? ''));
        $id = ShoppingListItem::create($householdId, $label, $quantity !== '' ? $quantity : null);
        Response::json(['id' => $id], 201);
    }

    public function update(array $params): void
    {
        $householdId = $this->requireHouseholdId();
        $itemId = (int) $params['id'];
        if (!ShoppingListItem::belongsToHousehold($itemId, $householdId)) {
            Response::error('Artikel gehört nicht zu deinem Haushalt.', 403);
        }
        $isDone = (bool) (Request::json()['isDone'] ?? false);
        ShoppingListItem::updateDone($itemId, $isDone);
        Response::json(null);
    }

    public function destroy(array $params): void
    {
        $householdId = $this->requireHouseholdId();
        $itemId = (int) $params['id'];
        if (!ShoppingListItem::belongsToHousehold($itemId, $householdId)) {
            Response::error('Artikel gehört nicht zu deinem Haushalt.', 403);
        }
        ShoppingListItem::delete($itemId);
        Response::json(null);
    }

    public function clearDone(): void
    {
        $householdId = $this->requireHouseholdId();
        ShoppingListItem::deleteDoneForHousehold($householdId);
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

    private function toPublicItem(array $item): array
    {
        return [
            'id' => (int) $item['id'],
            'label' => $item['label'],
            'quantity' => $item['quantity'],
            'isDone' => ((int) $item['is_done']) === 1,
            'createdAt' => $item['created_at'],
        ];
    }
}
