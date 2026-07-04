<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\CalendarEntry;
use App\Models\User;

final class CalendarController
{
    public function index(): void
    {
        $from = $_GET['from'] ?? date('Y-m-01');
        $to = $_GET['to'] ?? date('Y-m-t', strtotime((string) $from));

        $userId = Auth::userId();
        $viewerRole = $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';

        $entries = CalendarEntry::findInRange($from, $to, $viewerRole);
        Response::json(array_map([$this, 'toPublicEntry'], $entries));
    }

    public function store(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $body = Request::json();
        $title = trim($body['title'] ?? '');
        $startsAt = $body['startsAt'] ?? '';
        if ($title === '' || $startsAt === '') {
            Response::error('Titel und Startzeit sind Pflichtfelder.', 422);
        }
        $id = CalendarEntry::create(
            $body['type'] ?? 'appointment',
            (int) $user['household_id'],
            $title,
            $startsAt,
            $body['endsAt'] ?? null,
            (bool) ($body['allDay'] ?? false),
            $body['visibility'] ?? 'neighbors'
        );
        Response::json(['id' => $id], 201);
    }

    private function toPublicEntry(array $e): array
    {
        return [
            'id' => (int) $e['id'],
            'type' => $e['type'],
            'title' => $e['title'],
            'startsAt' => $e['starts_at'],
            'endsAt' => $e['ends_at'],
            'allDay' => (bool) $e['all_day'],
        ];
    }
}
