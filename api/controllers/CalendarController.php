<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\RecurrenceExpander;
use App\Core\Request;
use App\Core\Response;
use App\Models\CalendarEntry;
use App\Models\Child;
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
        $entries = $this->expandEntries($calendarEntries, $from, $to, $viewerHouseholdId !== null ? (int) $viewerHouseholdId : null);

        $events = [];
        foreach (Event::findInRange($from, $to, $viewerRole) as $event) {
            foreach (RecurrenceExpander::occurrencesInRange($event, $from, $to) as $occurrence) {
                $events[] = $this->toCalendarEvent($occurrence);
            }
        }

        $items = array_merge($entries, $events, $this->birthdayItems($from, $to));
        usort($items, fn(array $a, array $b) => strcmp($a['startsAt'], $b['startsAt']));
        Response::json($items);
    }

    // Geburtstage stehen nicht als eigene Kalendereinträge in der DB, sondern
    // werden hier aus Profil- (users.birthday) und Kinder-Daten
    // (children.birthdate) synthetisiert - wie echte Events, die auch
    // automatisch im Kalender auftauchen. Jährlich wiederkehrend, ganztägig,
    // im Kalender nicht editierbar (Pflege im Profil bzw. bei den Kindern).
    // Kinder-Geburtstage sind bewusst für alle Nachbarn sichtbar.
    private function birthdayItems(string $from, string $to): array
    {
        $sources = [];
        foreach (User::withBirthday() as $r) {
            $sources[] = ['prefix' => 'birthday-user', 'row' => $r];
        }
        foreach (Child::withBirthday() as $r) {
            $sources[] = ['prefix' => 'birthday-child', 'row' => $r];
        }

        $items = [];
        foreach ($sources as $s) {
            $row = $s['row'];
            $birthDate = substr((string) $row['birthday'], 0, 10);
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthDate)) {
                continue;
            }
            $birthYear = (int) substr($birthDate, 0, 4);
            $fakeEntry = [
                'starts_at' => $birthDate . 'T00:00:00',
                'ends_at' => null,
                'recurrence_rule' => 'yearly',
                'recurrence_until' => null,
            ];
            foreach (RecurrenceExpander::occurrencesInRange($fakeEntry, $from, $to) as $occ) {
                $occYear = (int) substr((string) $occ['starts_at'], 0, 4);
                $age = $occYear - $birthYear;
                $items[] = [
                    'id' => $s['prefix'] . '-' . (int) $row['id'] . '-' . $occYear,
                    'type' => 'birthday',
                    'title' => '🎂 ' . $row['name'] . ($age > 0 ? ' (wird ' . $age . ')' : ''),
                    'startsAt' => $occ['starts_at'],
                    'endsAt' => null,
                    'allDay' => true,
                    'visibility' => 'neighbors',
                    'recurrenceRule' => 'yearly',
                    'recurrenceUntil' => null,
                    'canManage' => false,
                    'source' => 'birthday',
                    'eventId' => null,
                    'creatorHouseholdName' => $row['household_name'] ?? null,
                    'creatorHouseholdAvatarKey' => $row['household_avatar_key'] ?? null,
                ];
            }
        }
        return $items;
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
            $user['household_id'] !== null ? (int) $user['household_id'] : null
        ));
    }

    public function destroy(array $params): void
    {
        $this->requireManagingUser((int) $params['id']);
        CalendarEntry::delete((int) $params['id']);
        Response::json(null);
    }

    // Bewusst kein Admin-Override mehr (anders als sonst im Adminbereich
    // üblich): Termine im normalen Kalender darf nur der erstellende
    // Haushalt bearbeiten/löschen. Admins moderieren stattdessen bewusst
    // getrennt über den eigenen Adminbereich (/admin/calendar), nicht
    // beiläufig über den normalen "Termindetails"-Dialog.
    private function requireManagingUser(int $entryId): array
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        $entry = CalendarEntry::findById($entryId);
        if ($user === null || $entry === null) {
            Response::error('Termin nicht gefunden.', 404);
        }
        $isOwner = $user['household_id'] !== null && (int) $user['household_id'] === (int) $entry['household_id'];
        if (!$isOwner) {
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

    private function expandEntries(array $entries, string $from, string $to, ?int $viewerHouseholdId): array
    {
        $result = [];
        foreach ($entries as $entry) {
            foreach (RecurrenceExpander::occurrencesInRange($entry, $from, $to) as $occurrence) {
                $result[] = $this->toPublicEntry($occurrence, $viewerHouseholdId);
            }
        }
        return $result;
    }

    // Bewusst kein Admin-Override (siehe requireManagingUser) - "canManage"
    // heißt hier ausschließlich "ist der erstellende Haushalt".
    private function toPublicEntry(?array $e, ?int $viewerHouseholdId): array
    {
        if ($e === null) {
            Response::error('Termin nicht gefunden.', 404);
        }
        $canManage = $viewerHouseholdId !== null && $viewerHouseholdId === (int) $e['household_id'];
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
            'creatorHouseholdName' => $e['household_name'] ?? null,
            'creatorHouseholdAvatarKey' => $e['household_avatar_key'] ?? null,
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
            'recurrenceRule' => $e['recurrence_rule'] ?? 'none',
            'recurrenceUntil' => $e['recurrence_until'] ?? null,
            'canManage' => false,
            'source' => 'event',
            'eventId' => (int) $e['id'],
        ];
    }
}
