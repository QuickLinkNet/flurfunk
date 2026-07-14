<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;
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
            'upcomingDates' => $this->upcomingDates(),
            'wastePickups' => $this->wastePickups(),
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

    private function upcomingDates(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM calendar_entries
             WHERE type != "trash" AND starts_at >= CURRENT_TIMESTAMP
             ORDER BY starts_at ASC
             LIMIT 4'
        );
        $stmt->execute();
        return array_map([$this, 'calendarRow'], $stmt->fetchAll());
    }

    private function wastePickups(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM calendar_entries
             WHERE type = "trash" AND starts_at >= CURRENT_TIMESTAMP
             ORDER BY starts_at ASC
             LIMIT 4'
        );
        $stmt->execute();
        return array_map([$this, 'calendarRow'], $stmt->fetchAll());
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
            'title' => 'Kanalreinigung am 24.05.',
            'message' => 'Bitte Parkplätze freihalten.',
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
        ];
    }

    private function feedBadge(string $type): string
    {
        if (str_contains($type, 'available')) return 'Angebot';
        if (str_contains($type, 'needed')) return 'Gesuch';
        return 'Info';
    }
}
