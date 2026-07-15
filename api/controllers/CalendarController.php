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
        $user = $userId !== null ? User::findById($userId) : null;
        $viewerRole = $user !== null ? ($user['role'] ?? 'guest') : 'guest';
        $viewerHouseholdId = $user['household_id'] ?? null;

        $entries = CalendarEntry::findInRange($from, $to, $viewerRole, $viewerHouseholdId !== null ? (int) $viewerHouseholdId : null);
        Response::json(array_map(
            fn(array $entry) => $this->toPublicEntry($entry, $viewerRole, $viewerHouseholdId !== null ? (int) $viewerHouseholdId : null),
            $entries
        ));
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
        $type = $this->validType($body['type'] ?? 'appointment');
        $visibility = $this->validVisibility($body['visibility'] ?? 'neighbors');
        $id = CalendarEntry::create(
            $type,
            (int) $user['household_id'],
            $title,
            $startsAt,
            $body['endsAt'] ?? null,
            (bool) ($body['allDay'] ?? false),
            $visibility
        );
        Response::json(['id' => $id], 201);
    }

    public function update(array $params): void
    {
        $user = $this->requireManagingUser((int) $params['id']);
        $body = Request::json();
        $title = trim($body['title'] ?? '');
        $startsAt = $body['startsAt'] ?? '';
        if ($title === '' || $startsAt === '') {
            Response::error('Titel und Startzeit sind Pflichtfelder.', 422);
        }

        CalendarEntry::update(
            (int) $params['id'],
            $this->validType($body['type'] ?? 'appointment'),
            $title,
            $startsAt,
            $body['endsAt'] ?? null,
            (bool) ($body['allDay'] ?? false),
            $this->validVisibility($body['visibility'] ?? 'neighbors')
        );
        Response::json($this->toPublicEntry(
            CalendarEntry::findById((int) $params['id']),
            $user['role'],
            $user['household_id'] !== null ? (int) $user['household_id'] : null
        ));
    }

    public function destroy(array $params): void
    {
        $this->requireManagingUser((int) $params['id']);
        CalendarEntry::delete((int) $params['id']);
        Response::json(null);
    }

    private function requireManagingUser(int $entryId): array
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        $entry = CalendarEntry::findById($entryId);
        if ($user === null || $entry === null) {
            Response::error('Termin nicht gefunden.', 404);
        }
        $isOwner = $user['household_id'] !== null && (int) $user['household_id'] === (int) $entry['household_id'];
        if ($user['role'] !== 'admin' && !$isOwner) {
            Response::error('Du kannst nur eigene Termine bearbeiten.', 403);
        }
        return $user;
    }

    private function validType(string $type): string
    {
        return in_array($type, CalendarEntry::TYPES, true) ? $type : 'appointment';
    }

    private function validVisibility(string $visibility): string
    {
        return in_array($visibility, CalendarEntry::VISIBILITIES, true) ? $visibility : 'neighbors';
    }

    private function toPublicEntry(?array $e, string $viewerRole, ?int $viewerHouseholdId): array
    {
        if ($e === null) {
            Response::error('Termin nicht gefunden.', 404);
        }
        $canManage = $viewerRole === 'admin' || ($viewerHouseholdId !== null && $viewerHouseholdId === (int) $e['household_id']);
        return [
            'id' => (int) $e['id'],
            'type' => $e['type'],
            'title' => $e['title'],
            'startsAt' => $e['starts_at'],
            'endsAt' => $e['ends_at'],
            'allDay' => (bool) $e['all_day'],
            'visibility' => $e['visibility'],
            'canManage' => $canManage,
        ];
    }
}
