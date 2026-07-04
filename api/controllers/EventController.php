<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\Event;
use App\Models\EventResponse;
use App\Models\User;

final class EventController
{
    public function index(): void
    {
        $viewerRole = $this->viewerRole();
        Response::json(array_map([$this, 'toPublicEvent'], Event::findUpcoming($viewerRole)));
    }

    public function show(array $params): void
    {
        $event = Event::findById((int) $params['id']);
        if ($event === null || !$this->isVisible($event, $this->viewerRole())) {
            Response::error('Event nicht gefunden.', 404);
        }
        $responses = EventResponse::findByEvent((int) $event['id']);
        Response::json([
            'event' => $this->toPublicEvent($event),
            'responses' => array_map([$this, 'toPublicResponse'], $responses),
        ]);
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
        $type = $body['type'] ?? '';
        $startsAt = $body['startsAt'] ?? '';
        if ($title === '' || $startsAt === '') {
            Response::error('Titel und Startzeit sind Pflichtfelder.', 422);
        }
        if (!in_array($type, Event::TYPES, true)) {
            Response::error('Unbekannter Event-Typ.', 422);
        }
        $visibility = in_array($body['visibility'] ?? '', ['public', 'neighbors'], true)
            ? $body['visibility']
            : 'neighbors';

        $id = Event::create(
            (int) $user['household_id'],
            $title,
            $type,
            $body['description'] ?? null,
            $body['location'] ?? null,
            $startsAt,
            $body['endsAt'] ?? null,
            $visibility
        );
        Response::json(['id' => $id], 201);
    }

    public function rsvp(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $event = Event::findById((int) $params['id']);
        if ($event === null || !$this->isVisible($event, $this->viewerRole())) {
            Response::error('Event nicht gefunden.', 404);
        }
        $body = Request::json();
        $response = $body['response'] ?? '';
        if (!in_array($response, ['yes', 'maybe', 'no'], true)) {
            Response::error('Ungültige Antwort.', 422);
        }
        EventResponse::upsert(
            (int) $event['id'],
            (int) $user['household_id'],
            $response,
            isset($body['adultsCount']) ? (int) $body['adultsCount'] : null,
            isset($body['childrenCount']) ? (int) $body['childrenCount'] : null,
            $body['note'] ?? null,
            $userId
        );
        Response::json(['success' => true]);
    }

    private function viewerRole(): string
    {
        $userId = Auth::userId();
        return $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';
    }

    private function isVisible(array $event, string $viewerRole): bool
    {
        if ($event['visibility'] === 'public') {
            return true;
        }
        return $viewerRole !== 'guest';
    }

    private function toPublicEvent(array $e): array
    {
        return [
            'id' => (int) $e['id'],
            'title' => $e['title'],
            'type' => $e['type'],
            'description' => $e['description'],
            'location' => $e['location'],
            'startsAt' => $e['starts_at'],
            'endsAt' => $e['ends_at'],
            'visibility' => $e['visibility'],
            'creatorHouseholdName' => $e['creator_household_name'],
            'createdAt' => $e['created_at'],
            'rsvpCounts' => [
                'yes' => (int) ($e['yes_count'] ?? 0),
                'maybe' => (int) ($e['maybe_count'] ?? 0),
                'no' => (int) ($e['no_count'] ?? 0),
            ],
        ];
    }

    private function toPublicResponse(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'householdId' => (int) $r['household_id'],
            'householdName' => $r['household_name'],
            'response' => $r['response'],
            'adultsCount' => $r['adults_count'] !== null ? (int) $r['adults_count'] : null,
            'childrenCount' => $r['children_count'] !== null ? (int) $r['children_count'] : null,
            'note' => $r['note'],
            'updatedAt' => $r['updated_at'],
        ];
    }
}
