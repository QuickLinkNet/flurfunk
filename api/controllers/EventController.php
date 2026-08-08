<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\Event;
use App\Models\EventResponse;
use App\Models\PushSubscription;
use App\Models\User;

final class EventController
{
    public function index(): void
    {
        $user = $this->viewerUser();
        $viewerRole = $user['role'] ?? 'guest';
        Response::json(array_map(
            fn(array $event) => $this->toPublicEvent($event, $user),
            Event::findUpcoming($viewerRole)
        ));
    }

    public function show(array $params): void
    {
        $event = Event::findById((int) $params['id']);
        if ($event === null || !$this->isVisible($event, $this->viewerRole())) {
            Response::error('Event nicht gefunden.', 404);
        }
        $user = $this->viewerUser();
        $responses = EventResponse::findByEvent((int) $event['id']);
        Response::json([
            'event' => $this->toPublicEvent($event, $user),
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
        $payload = $this->validatedEventPayload(Request::json());

        $id = Event::create(
            (int) $user['household_id'],
            $payload['title'],
            $payload['type'],
            $payload['description'],
            $payload['location'],
            $payload['startsAt'],
            $payload['endsAt'],
            $payload['visibility']
        );
        Response::json(['id' => $id], 201);
    }

    public function update(array $params): void
    {
        $event = $this->requireManagingEvent((int) $params['id']);
        $body = Request::json();
        $payload = $this->validatedEventPayload($body);

        Event::update(
            (int) $event['id'],
            $payload['title'],
            $payload['type'],
            $payload['description'],
            $payload['location'],
            $payload['startsAt'],
            $payload['endsAt'],
            $payload['visibility']
        );

        $user = $this->viewerUser();
        Response::json($this->toPublicEvent(Event::findById((int) $event['id']), $user));
    }

    public function destroy(array $params): void
    {
        $event = $this->requireManagingEvent((int) $params['id']);
        Event::delete((int) $event['id']);
        Response::json(null);
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
            isset($body['adultsCount']) ? max(0, (int) $body['adultsCount']) : null,
            isset($body['childrenCount']) ? max(0, (int) $body['childrenCount']) : null,
            $body['note'] ?? null,
            $userId
        );
        Response::json(['success' => true]);
    }

    public function remind(array $params): void
    {
        $userId = Auth::requireLogin();
        $event = $this->requireManagingEvent((int) $params['id']);

        $subscriptions = PushSubscription::findForEventNonResponders((int) $event['id'], $userId);
        $householdIds = array_unique(array_filter(array_map(
            static fn(array $s) => $s['reminder_household_id'] !== null ? (int) $s['reminder_household_id'] : null,
            $subscriptions
        )));

        $push = PushService::sendEventReminder((int) $event['id'], $userId, [
            'title' => 'Erinnerung: ' . $event['title'],
            'body' => 'Sag uns kurz Bescheid, ob du dabei bist.',
            'url' => '/apps/neighborhood/events/' . $event['id'],
        ]);

        Response::json(['push' => $push, 'remindedHouseholds' => count($householdIds)]);
    }

    private function viewerRole(): string
    {
        $userId = Auth::userId();
        return $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';
    }

    private function viewerUser(): array
    {
        $userId = Auth::userId();
        if ($userId === null) {
            return ['role' => 'guest', 'household_id' => null];
        }
        return User::findById($userId) ?? ['role' => 'guest', 'household_id' => null];
    }

    private function requireManagingEvent(int $eventId): array
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        $event = Event::findById($eventId);
        if ($user === null || $event === null) {
            Response::error('Event nicht gefunden.', 404);
        }
        $isOwner = $user['household_id'] !== null && (int) $user['household_id'] === (int) $event['creator_household_id'];
        if ($user['role'] !== 'admin' && !$isOwner) {
            Response::error('Du kannst nur eigene Events bearbeiten.', 403);
        }
        return $event;
    }

    private function validatedEventPayload(array $body): array
    {
        $title = trim($body['title'] ?? '');
        $type = $body['type'] ?? '';
        $startsAt = $body['startsAt'] ?? '';
        if ($title === '' || $startsAt === '') {
            Response::error('Titel und Startzeit sind Pflichtfelder.', 422);
        }
        $endsAt = trim((string) ($body['endsAt'] ?? ''));
        $endsAt = $endsAt !== '' ? $endsAt : null;
        if ($endsAt !== null && strtotime((string) $endsAt) < strtotime((string) $startsAt)) {
            Response::error('Die Endzeit darf nicht vor der Startzeit liegen.', 422);
        }
        if (!in_array($type, Event::TYPES, true)) {
            Response::error('Unbekannter Event-Typ.', 422);
        }
        $visibility = in_array($body['visibility'] ?? '', ['public', 'neighbors'], true)
            ? $body['visibility']
            : 'neighbors';

        return [
            'title' => $title,
            'type' => $type,
            'description' => $body['description'] ?? null,
            'location' => $body['location'] ?? null,
            'startsAt' => $startsAt,
            'endsAt' => $endsAt,
            'visibility' => $visibility,
        ];
    }

    private function isVisible(array $event, string $viewerRole): bool
    {
        if ($event['visibility'] === 'public') {
            return true;
        }
        return $viewerRole !== 'guest';
    }

    private function toPublicEvent(?array $e, array $viewerUser = ['role' => 'guest', 'household_id' => null]): array
    {
        if ($e === null) {
            Response::error('Event nicht gefunden.', 404);
        }
        $canManage = ($viewerUser['role'] ?? 'guest') === 'admin'
            || ($viewerUser['household_id'] !== null && (int) $viewerUser['household_id'] === (int) $e['creator_household_id']);
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
            'canManage' => $canManage,
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
