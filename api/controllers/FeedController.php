<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\FeedItem;
use App\Models\User;

final class FeedController
{
    public function index(): void
    {
        $userId = Auth::userId();
        $viewerRole = $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';
        Response::json(array_map([$this, 'toPublicItem'], FeedItem::findVisible($viewerRole)));
    }

    public function store(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $body = Request::json();
        $type = $body['type'] ?? '';
        if (!in_array($type, FeedItem::MVP_TYPES, true)) {
            Response::error('Unbekannter Post-Typ.', 422);
        }
        $visibility = in_array($body['visibility'] ?? '', ['public', 'neighbors', 'private'], true)
            ? $body['visibility']
            : 'neighbors';

        $id = FeedItem::create(
            (int) $user['household_id'],
            $type,
            $body['message'] ?? null,
            $visibility,
            $body['expiresAt'] ?? null
        );
        Response::json(['id' => $id], 201);
    }

    private function toPublicItem(array $item): array
    {
        return [
            'id' => (int) $item['id'],
            'householdName' => $item['household_name'],
            'type' => $item['type'],
            'message' => $item['message'],
            'visibility' => $item['visibility'],
            'createdAt' => $item['created_at'],
        ];
    }
}
