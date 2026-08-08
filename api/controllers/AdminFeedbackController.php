<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\FeedbackReport;
use App\Models\User;

final class AdminFeedbackController
{
    public function index(): void
    {
        $this->requireAdmin();
        Response::json(array_map([$this, 'toPublicReport'], FeedbackReport::findAll()));
    }

    public function updateStatus(array $params): void
    {
        $this->requireAdmin();
        $body = Request::json();
        $status = (string) ($body['status'] ?? '');
        if (!in_array($status, ['open', 'done'], true)) {
            Response::error('Ungültiger Status.', 422);
        }
        FeedbackReport::updateStatus((int) $params['id'], $status);
        Response::json(['status' => $status]);
    }

    public function destroy(array $params): void
    {
        $this->requireAdmin();
        FeedbackReport::delete((int) $params['id']);
        Response::json(null);
    }

    private function toPublicReport(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'reporterName' => $r['reporter_name'],
            'householdName' => $r['household_name'],
            'category' => $r['category'],
            'message' => $r['message'],
            'pagePath' => $r['page_path'],
            'status' => $r['status'],
            'createdAt' => $r['created_at'],
        ];
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
