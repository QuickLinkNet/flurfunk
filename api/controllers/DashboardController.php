<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;
use App\Models\CalendarEntry;
use App\Models\DashboardNotice;
use App\Models\User;
use PDO;

final class DashboardController
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::pdo();
    }

    public function index(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        Response::json([
            'streetName' => $this->streetName(),
            'householdsStatus' => $this->householdsStatus($user['role'] ?? 'guest'),
            'todayEvents' => $this->todayEvents(),
            'quickUpdates' => $this->quickUpdates($user['role'] ?? 'guest'),
            'childrenToday' => $this->childrenToday((int) ($user['household_id'] ?? 0)),
            'upcomingDates' => $this->upcomingDates($user['role'] ?? 'guest', $user['household_id'] !== null ? (int) $user['household_id'] : null),
            'wastePickups' => $this->wastePickups($user['role'] ?? 'guest', $user['household_id'] !== null ? (int) $user['household_id'] : null),
            'vacations' => $this->vacations(),
            'notice' => $this->notice(),
        ]);
    }

    private function streetName(): string
    {
        return (string) $this->pdo->query('SELECT name FROM streets ORDER BY id LIMIT 1')->fetchColumn();
    }

    private function householdsStatus(string $role): array
    {
        $allowed = $role === 'guest' ? ['public'] : ['public', 'neighbors'];
        $stmt = $this->pdo->prepare(
            'SELECT h.* FROM households h
             LEFT JOIN household_visibility_settings v ON v.household_id = h.id AND v.field_key = "status"
             WHERE COALESCE(v.visibility, "neighbors") IN (' . implode(',', array_fill(0, count($allowed), '?')) . ')
             ORDER BY h.name'
        );
        $stmt->execute($allowed);
        return array_map(fn(array $h) => [
            'id' => (int) $h['id'],
            'name' => $h['name'],
            'addressLine' => $h['address_line'],
            'statusEmoji' => $h['status_emoji'],
            'statusLabel' => $h['status_label'],
            'statusNote' => $h['status_note'],
            'statusUpdatedAt' => $h['status_updated_at'],
        ], $stmt->fetchAll());
    }

    private function todayEvents(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT e.*, h.name AS creator_household_name
             FROM events e
             JOIN households h ON h.id = e.creator_household_id
             WHERE e.starts_at >= datetime("now", "start of day")
               AND e.starts_at < datetime("now", "start of day", "+1 day")
             ORDER BY e.starts_at ASC
             LIMIT 4'
        );
        $stmt->execute();
        return array_map([$this, 'eventRow'], $stmt->fetchAll());
    }

    private function quickUpdates(string $role): array
    {
        $allowed = $role === 'guest' ? ['public'] : ['public', 'neighbors'];
        $stmt = $this->pdo->prepare(
            'SELECT f.*, h.name AS household_name
             FROM feed_items f
             JOIN households h ON h.id = f.household_id
             WHERE f.visibility IN (' . implode(',', array_fill(0, count($allowed), '?')) . ')
               AND (f.expires_at IS NULL OR f.expires_at > CURRENT_TIMESTAMP)
             ORDER BY f.created_at DESC
             LIMIT 4'
        );
        $stmt->execute($allowed);
        return array_map(fn(array $f) => [
            'id' => (int) $f['id'],
            'householdName' => $f['household_name'],
            'type' => $f['type'],
            'message' => $f['message'],
            'createdAt' => $f['created_at'],
            'badge' => $this->feedBadge($f['type']),
        ], $stmt->fetchAll());
    }

    private function childrenToday(int $householdId): array
    {
        if ($householdId === 0) {
            return [];
        }
        $stmt = $this->pdo->prepare('SELECT * FROM children WHERE household_id = ? ORDER BY name LIMIT 4');
        $stmt->execute([$householdId]);
        return array_map(fn(array $c) => [
            'id' => (int) $c['id'],
            'name' => $c['name'],
            'currentLocation' => $c['current_location'],
            'locationNote' => $c['location_note'],
            'updatedAt' => $c['updated_at'],
        ], $stmt->fetchAll());
    }

    private function upcomingDates(string $role, ?int $householdId): array
    {
        return array_slice(array_values(array_filter(
            $this->expandedCalendarRows($role, $householdId),
            fn(array $entry) => $entry['type'] !== 'trash'
        )), 0, 4);
    }

    private function wastePickups(string $role, ?int $householdId): array
    {
        return array_slice(array_values(array_filter(
            $this->expandedCalendarRows($role, $householdId),
            fn(array $entry) => $entry['type'] === 'trash'
        )), 0, 4);
    }

    private function vacations(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT h.id, h.name, h.status_label
             FROM households h
             WHERE lower(h.status_label) LIKE "%urlaub%"
             ORDER BY h.name
             LIMIT 4'
        );
        $stmt->execute();
        return array_map(fn(array $h) => [
            'id' => (int) $h['id'],
            'name' => $h['name'],
            'until' => null,
        ], $stmt->fetchAll());
    }

    private function notice(): array
    {
        $notice = DashboardNotice::latestActive();
        if ($notice !== null) {
            return [
                'title' => $notice['title'],
                'message' => $notice['message'],
            ];
        }

        return [
            'title' => 'Kein aktueller Hinweis',
            'message' => 'Sobald es etwas Wichtiges gibt, erscheint es hier.',
        ];
    }

    private function eventRow(array $e): array
    {
        return [
            'id' => (int) $e['id'],
            'title' => $e['title'],
            'location' => $e['location'],
            'startsAt' => $e['starts_at'],
            'endsAt' => $e['ends_at'],
            'creatorHouseholdName' => $e['creator_household_name'],
        ];
    }

    private function calendarRow(array $e): array
    {
        return [
            'id' => (int) $e['id'],
            'type' => $e['type'],
            'title' => $e['title'],
            'startsAt' => $e['starts_at'],
            'endsAt' => $e['ends_at'],
            'allDay' => (bool) $e['all_day'],
            'visibility' => $e['visibility'] ?? 'neighbors',
            'recurrenceRule' => $e['recurrence_rule'] ?? 'none',
            'recurrenceUntil' => $e['recurrence_until'] ?? null,
            'canManage' => false,
            'source' => 'calendar',
            'eventId' => null,
        ];
    }

    private function expandedCalendarRows(string $role, ?int $householdId): array
    {
        $from = gmdate('Y-m-d\TH:i:s\Z');
        $to = gmdate('Y-m-d\TH:i:s\Z', strtotime('+90 days'));
        $rows = [];
        foreach (CalendarEntry::findInRange($from, $to, $role, $householdId) as $entry) {
            if (($entry['recurrence_rule'] ?? 'none') === 'none') {
                $rows[] = $this->calendarRow($entry);
                continue;
            }
            foreach ($this->recurringCalendarRows($entry, $from, $to) as $occurrence) {
                $rows[] = $this->calendarRow($occurrence);
            }
        }
        usort($rows, fn(array $a, array $b) => strcmp($a['startsAt'], $b['startsAt']));
        return $rows;
    }

    private function recurringCalendarRows(array $entry, string $from, string $to): array
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
            $copy = $entry;
            $copy['starts_at'] = $occurrenceStart->format('Y-m-d\TH:i:s');
            $copy['ends_at'] = $occurrenceEnd?->format('Y-m-d\TH:i:s');
            $items[] = $copy;
            $occurrenceStart = $occurrenceStart->add($interval);
            $guard++;
        }
        return $items;
    }

    private function feedBadge(string $type): string
    {
        if (str_contains($type, 'available')) return 'Angebot';
        if (str_contains($type, 'needed')) return 'Gesuch';
        return 'Info';
    }
}
