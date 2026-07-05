<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\CalendarEntry;
use App\Models\Child;
use App\Models\Event;
use App\Models\FeedItem;
use App\Models\Household;
use App\Models\User;

final class AdminController
{
    public function households(): void
    {
        $this->requireAdmin();
        $households = array_map(function (array $h): array {
            return [
                'id' => (int) $h['id'],
                'name' => $h['name'],
                'addressLine' => $h['address_line'],
                'streetName' => $h['street_name'],
                'statusEmoji' => $h['status_emoji'],
                'statusLabel' => $h['status_label'],
                'createdAt' => $h['created_at'],
                'members' => array_map(fn(array $u) => $this->toPublicUser($u), User::findByHousehold((int) $h['id'])),
                'children' => array_map(fn(array $c) => [
                    'id' => (int) $c['id'],
                    'name' => $c['name'],
                    'currentLocation' => $c['current_location'],
                ], Child::findByHousehold((int) $h['id'])),
            ];
        }, Household::findAll());
        Response::json($households);
    }

    public function deleteHousehold(array $params): void
    {
        $this->requireAdmin();
        Household::delete((int) $params['id']);
        Response::json(null);
    }

    public function users(): void
    {
        $this->requireAdmin();
        $users = array_map(function (array $u): array {
            $public = $this->toPublicUser($u);
            $public['householdName'] = $u['household_name'];
            return $public;
        }, User::findAll());
        Response::json($users);
    }

    public function updateUserRole(array $params): void
    {
        $adminId = $this->requireAdmin();
        $userId = (int) $params['id'];
        $body = Request::json();
        $role = $body['role'] ?? '';
        if (!in_array($role, ['admin', 'member', 'guest'], true)) {
            Response::error('Ungültige Rolle.', 422);
        }
        if ($userId === $adminId && $role !== 'admin') {
            Response::error('Du kannst dir nicht selbst die Admin-Rolle entziehen.', 422);
        }
        User::updateRole($userId, $role);
        Response::json(null);
    }

    public function feed(): void
    {
        $this->requireAdmin();
        $items = array_map(fn(array $f) => [
            'id' => (int) $f['id'],
            'householdName' => $f['household_name'],
            'type' => $f['type'],
            'message' => $f['message'],
            'visibility' => $f['visibility'],
            'createdAt' => $f['created_at'],
        ], FeedItem::findAll());
        Response::json($items);
    }

    public function deleteFeedItem(array $params): void
    {
        $this->requireAdmin();
        FeedItem::delete((int) $params['id']);
        Response::json(null);
    }

    public function events(): void
    {
        $this->requireAdmin();
        $events = array_map(fn(array $e) => [
            'id' => (int) $e['id'],
            'title' => $e['title'],
            'type' => $e['type'],
            'creatorHouseholdName' => $e['creator_household_name'],
            'startsAt' => $e['starts_at'],
            'visibility' => $e['visibility'],
            'rsvpCounts' => [
                'yes' => (int) ($e['yes_count'] ?? 0),
                'maybe' => (int) ($e['maybe_count'] ?? 0),
                'no' => (int) ($e['no_count'] ?? 0),
            ],
        ], Event::findAll());
        Response::json($events);
    }

    public function deleteEvent(array $params): void
    {
        $this->requireAdmin();
        Event::delete((int) $params['id']);
        Response::json(null);
    }

    public function calendar(): void
    {
        $this->requireAdmin();
        $entries = array_map(fn(array $e) => [
            'id' => (int) $e['id'],
            'type' => $e['type'],
            'title' => $e['title'],
            'startsAt' => $e['starts_at'],
            'endsAt' => $e['ends_at'],
        ], CalendarEntry::findAll());
        Response::json($entries);
    }

    public function deleteCalendarEntry(array $params): void
    {
        $this->requireAdmin();
        CalendarEntry::delete((int) $params['id']);
        Response::json(null);
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

    private function toPublicUser(array $u): array
    {
        return [
            'id' => (int) $u['id'],
            'email' => $u['email'],
            'displayName' => $u['display_name'],
            'role' => $u['role'],
            'householdId' => $u['household_id'] !== null ? (int) $u['household_id'] : null,
            'lastLoginAt' => $u['last_login_at'],
        ];
    }
}
