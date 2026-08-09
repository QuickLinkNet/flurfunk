<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\Event;
use App\Models\EventPoll;
use App\Models\EventPollOption;
use App\Models\EventPollVote;
use App\Models\Household;
use App\Models\User;

// "Terminfindung" (Doodle-artig): mehrere Terminvorschläge statt eines
// fixen Datums. Sobald ein Termin feststeht, wird daraus ein echtes Event
// erzeugt (Event::create) - ab da läuft die normale RSVP-Zusage weiter,
// hier passiert nichts Neues mehr.
final class EventPollController
{
    public function index(): void
    {
        $viewerRole = $this->viewerRole();
        Response::json(array_map([$this, 'toPublicPoll'], EventPoll::findUpcoming($viewerRole)));
    }

    public function show(array $params): void
    {
        $poll = EventPoll::findById((int) $params['id']);
        if ($poll === null || !$this->isVisible($poll, $this->viewerRole())) {
            Response::error('Terminfindung nicht gefunden.', 404);
        }
        Response::json($this->toPublicPoll($poll));
    }

    public function store(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }

        $body = Request::json();
        $title = trim((string) ($body['title'] ?? ''));
        $type = (string) ($body['type'] ?? '');
        $dates = $body['dates'] ?? [];
        if ($title === '' || !in_array($type, Event::TYPES, true)) {
            Response::error('Titel und Typ sind Pflicht.', 422);
        }
        if (!is_array($dates) || count($dates) < 2 || count($dates) > 5) {
            Response::error('Bitte zwischen 2 und 5 Terminvorschläge angeben.', 422);
        }
        $normalizedDates = [];
        foreach ($dates as $date) {
            $date = trim((string) $date);
            if ($date === '' || strtotime($date) === false) {
                Response::error('Ein Terminvorschlag ist ungültig.', 422);
            }
            $normalizedDates[] = $date;
        }
        $visibility = in_array($body['visibility'] ?? '', ['public', 'neighbors'], true) ? $body['visibility'] : 'neighbors';

        $pollId = EventPoll::create(
            (int) $user['household_id'],
            $title,
            $type,
            trim((string) ($body['description'] ?? '')) ?: null,
            trim((string) ($body['location'] ?? '')) ?: null,
            $visibility
        );
        EventPollOption::createMany($pollId, $normalizedDates);

        $push = null;
        try {
            $household = Household::findById((int) $user['household_id']);
            $push = PushService::sendFeedUpdate($userId, [
                'title' => 'Neue Terminfindung',
                'body' => ($household['name'] ?? 'Ein Nachbar') . ': "' . $title . '" - wann passt dir?',
                'url' => '/apps/neighborhood/terminfindung/' . $pollId,
            ]);
        } catch (\Throwable $e) {
            error_log('Event poll push failed: ' . $e->getMessage());
        }

        Response::json(['id' => $pollId, 'push' => $push], 201);
    }

    public function vote(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $poll = EventPoll::findById((int) $params['id']);
        if ($poll === null || !$this->isVisible($poll, $this->viewerRole())) {
            Response::error('Terminfindung nicht gefunden.', 404);
        }
        if ($poll['status'] !== 'open') {
            Response::error('Diese Terminfindung ist bereits abgeschlossen.', 422);
        }

        $votes = Request::json()['votes'] ?? [];
        if (!is_array($votes) || $votes === []) {
            Response::error('Keine Stimmen übermittelt.', 422);
        }

        $validOptionIds = array_map(fn(array $o) => (int) $o['id'], EventPollOption::findByPoll((int) $poll['id']));
        foreach ($votes as $vote) {
            $optionId = (int) ($vote['optionId'] ?? 0);
            $response = (string) ($vote['response'] ?? '');
            if (!in_array($optionId, $validOptionIds, true) || !in_array($response, ['yes', 'maybe', 'no'], true)) {
                Response::error('Ungültige Stimme.', 422);
            }
            EventPollVote::upsert($optionId, (int) $user['household_id'], $response, $userId);
        }

        Response::json($this->toPublicPoll(EventPoll::findById((int) $poll['id'])));
    }

    public function finalize(array $params): void
    {
        $poll = $this->requireManagingPoll((int) $params['id']);
        if ($poll['status'] !== 'open') {
            Response::error('Diese Terminfindung ist bereits abgeschlossen.', 422);
        }

        $optionId = (int) (Request::json()['optionId'] ?? 0);
        $option = EventPollOption::findById($optionId);
        if ($option === null || (int) $option['poll_id'] !== (int) $poll['id']) {
            Response::error('Termin nicht gefunden.', 404);
        }

        $eventId = Event::create(
            (int) $poll['creator_household_id'],
            $poll['title'],
            $poll['type'],
            $poll['description'],
            $poll['location'],
            $option['starts_at'],
            $option['ends_at'],
            $poll['visibility']
        );
        EventPoll::close((int) $poll['id'], $eventId);

        $push = null;
        try {
            $push = PushService::sendBroadcast([
                'title' => 'Termin steht!',
                'body' => '"' . $poll['title'] . '" ist jetzt fix - sag Bescheid, ob du dabei bist.',
                'url' => '/apps/neighborhood/events/' . $eventId,
            ]);
        } catch (\Throwable $e) {
            error_log('Event poll finalize push failed: ' . $e->getMessage());
        }

        Response::json(['eventId' => $eventId, 'push' => $push]);
    }

    public function destroy(array $params): void
    {
        $poll = $this->requireManagingPoll((int) $params['id']);
        EventPoll::delete((int) $poll['id']);
        Response::json(null);
    }

    private function viewerRole(): string
    {
        $userId = Auth::userId();
        return $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';
    }

    private function isVisible(array $poll, string $viewerRole): bool
    {
        if ($poll['visibility'] === 'public') {
            return true;
        }
        return $viewerRole !== 'guest';
    }

    private function requireManagingPoll(int $pollId): array
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        $poll = EventPoll::findById($pollId);
        if ($user === null || $poll === null) {
            Response::error('Terminfindung nicht gefunden.', 404);
        }
        $isOwner = $user['household_id'] !== null && (int) $user['household_id'] === (int) $poll['creator_household_id'];
        if ($user['role'] !== 'admin' && !$isOwner) {
            Response::error('Du kannst nur eigene Terminfindungen verwalten.', 403);
        }
        return $poll;
    }

    private function toPublicPoll(array $p): array
    {
        $pollId = (int) $p['id'];
        $userId = Auth::userId();
        $user = $userId !== null ? User::findById($userId) : null;
        $householdId = $user !== null && $user['household_id'] !== null ? (int) $user['household_id'] : null;

        $myVoteByOption = [];
        if ($householdId !== null) {
            foreach (EventPollVote::findForHousehold($pollId, $householdId) as $v) {
                $myVoteByOption[(int) $v['option_id']] = $v['response'];
            }
        }

        $canManage = $user !== null
            && (($user['role'] ?? '') === 'admin' || ($householdId !== null && $householdId === (int) $p['creator_household_id']));

        return [
            'id' => $pollId,
            'title' => $p['title'],
            'type' => $p['type'],
            'description' => $p['description'],
            'location' => $p['location'],
            'visibility' => $p['visibility'],
            'status' => $p['status'],
            'creatorHouseholdName' => $p['creator_household_name'],
            'resultingEventId' => $p['resulting_event_id'] !== null ? (int) $p['resulting_event_id'] : null,
            'createdAt' => $p['created_at'],
            'canManage' => $canManage,
            'options' => array_map(fn(array $o) => [
                'id' => (int) $o['id'],
                'startsAt' => $o['starts_at'],
                'endsAt' => $o['ends_at'],
                'yesCount' => (int) ($o['yes_count'] ?? 0),
                'maybeCount' => (int) ($o['maybe_count'] ?? 0),
                'noCount' => (int) ($o['no_count'] ?? 0),
                'myResponse' => $myVoteByOption[(int) $o['id']] ?? null,
            ], EventPollOption::findByPoll($pollId)),
        ];
    }
}
