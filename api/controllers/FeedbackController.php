<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\FeedbackReport;
use App\Models\User;

final class FeedbackController
{
    public function store(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $body = Request::json();
        $category = $body['category'] ?? '';
        if (!in_array($category, FeedbackReport::CATEGORIES, true)) {
            Response::error('Unbekannte Kategorie.', 422);
        }
        $message = trim((string) ($body['message'] ?? ''));
        if ($message === '') {
            Response::error('Bitte kurz beschreiben, worum es geht.', 422);
        }
        $messageLength = function_exists('mb_strlen') ? mb_strlen($message) : strlen($message);
        if ($messageLength > 500) {
            Response::error('Nachricht ist zu lang.', 422);
        }
        $pagePath = trim((string) ($body['pagePath'] ?? ''));
        $pagePath = $pagePath !== '' ? $pagePath : null;

        $householdId = $user['household_id'] !== null ? (int) $user['household_id'] : null;
        $id = FeedbackReport::create($userId, $householdId, $category, $message, $pagePath);

        $push = null;
        try {
            $push = PushService::sendToAdmins($userId, [
                'title' => 'Neues Feedback',
                'body' => $this->truncate($message, 120),
                'url' => '/apps/neighborhood/admin',
            ]);
        } catch (\Throwable $e) {
            error_log('Feedback push failed: ' . $e->getMessage());
        }

        Response::json(['id' => $id, 'push' => $push], 201);
    }

    private function truncate(string $message, int $maxLength): string
    {
        $length = function_exists('mb_strlen') ? mb_strlen($message) : strlen($message);
        if ($length <= $maxLength) {
            return $message;
        }
        $truncated = function_exists('mb_substr') ? mb_substr($message, 0, $maxLength) : substr($message, 0, $maxLength);
        return $truncated . '…';
    }
}
