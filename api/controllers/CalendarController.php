<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\CalendarEntry;
use App\Models\Event;
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

        $calendarEntries = CalendarEntry::findInRange($from, $to, $viewerRole, $viewerHouseholdId !== null ? (int) $viewerHouseholdId : null);
        $entries = $this->expandEntries($calendarEntries, $from, $to, $viewerRole, $viewerHouseholdId !== null ? (int) $viewerHouseholdId : null);
        $events = array_map([$this, 'toCalendarEvent'], Event::findInRange($from, $to, $viewerRole));

        $items = array_merge($entries, $events);
        usort($items, fn(array $a, array $b) => strcmp($a['startsAt'], $b['startsAt']));
        Response::json($items);
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
            $visibility,
            $this->validRecurrenceRule($body['recurrenceRule'] ?? 'none'),
            $this->normalizeNullableDate($body['recurrenceUntil'] ?? null)
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
            $this->validVisibility($body['visibility'] ?? 'neighbors'),
            $this->validRecurrenceRule($body['recurrenceRule'] ?? 'none'),
            $this->normalizeNullableDate($body['recurrenceUntil'] ?? null)
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

    private function validRecurrenceRule(string $rule): string
    {
        return in_array($rule, CalendarEntry::RECURRENCE_RULES, true) ? $rule : 'none';
    }

    private function normalizeNullableDate(mixed $value): ?string
    {
        $normalized = trim((string) ($value ?? ''));
        return $normalized !== '' ? $normalized : null;
    }

    private function expandEntries(array $entries, string $from, string $to, string $viewerRole, ?int $viewerHouseholdId): array
    {
        $result = [];
        foreach ($entries as $entry) {
            $rule = $entry['recurrence_rule'] ?? 'none';
            if ($rule === 'none') {
                $result[] = $this->toPublicEntry($entry, $viewerRole, $viewerHouseholdId);
                continue;
            }
            foreach ($this->recurringOccurrences($entry, $from, $to) as $occurrence) {
                $result[] = $this->toPublicEntry($occurrence, $viewerRole, $viewerHouseholdId);
            }
        }
        return $result;
    }

    private function recurringOccurrences(array $entry, string $from, string $to): array
    {
        $startsAt = new \DateTimeImmutable(str_replace(' ', 'T', $entry['starts_at']));
        $endsAt = $entry['ends_at'] !== null ? new \DateTimeImmutable(str_replace(' ', 'T', $entry['ends_at'])) : null;
        $fromDate = new \DateTimeImmutable($from);
        $toDate = new \DateTimeImmutable($to);
        $until = $entry['recurrence_until'] !== null ? new \DateTimeImmutable(str_replace(' ', 'T', $entry['recurrence_until'])) : $toDate;
        if ($until > $toDate) {
            $until = $toDate;
        }

        $interval = match ($entry['recurrence_rule']) {
            'daily' => new \DateInterval('P1D'),
            'weekly' => new \DateInterval('P1W'),
            'monthly' => new \DateInterval('P1M'),
            default => new \DateInterval('P100Y'),
        };

        $duration = $endsAt !== null ? $startsAt->diff($endsAt) : null;
        $occurrenceStart = $startsAt;
        $guard = 0;
        while ($occurrenceStart < $fromDate && $guard < 500) {
            $occurrenceStart = $occurrenceStart->add($interval);
            $guard++;
        }

        $items = [];
        while ($occurrenceStart <= $until && $guard < 800) {
            $occurrenceEnd = $duration !== null ? $occurrenceStart->add($duration) : null;
            if ($occurrenceStart < $toDate && ($occurrenceEnd === null || $occurrenceEnd >= $fromDate)) {
                $copy = $entry;
                $copy['starts_at'] = $occurrenceStart->format('Y-m-d\TH:i:s');
                $copy['ends_at'] = $occurrenceEnd?->format('Y-m-d\TH:i:s');
                $items[] = $copy;
            }
            $occurrenceStart = $occurrenceStart->add($interval);
            $guard++;
        }
        return $items;
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
            'recurrenceRule' => $e['recurrence_rule'] ?? 'none',
            'recurrenceUntil' => $e['recurrence_until'] ?? null,
            'canManage' => $canManage,
            'source' => 'calendar',
            'eventId' => null,
        ];
    }

    private function toCalendarEvent(array $e): array
    {
        return [
            'id' => 'event-' . (int) $e['id'],
            'type' => 'event',
            'title' => $e['title'],
            'startsAt' => $e['starts_at'],
            'endsAt' => $e['ends_at'],
            'allDay' => false,
            'visibility' => $e['visibility'],
            'recurrenceRule' => 'none',
            'recurrenceUntil' => null,
            'canManage' => false,
            'source' => 'event',
            'eventId' => (int) $e['id'],
        ];
    }
}
