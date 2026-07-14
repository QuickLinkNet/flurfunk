<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\CalendarEntry;
use App\Models\Child;
use App\Models\DashboardNotice;
use App\Models\Event;
use App\Models\FeedItem;
use App\Models\Household;
use App\Models\HouseholdInvite;
use App\Models\Pet;
use App\Models\PushSubscription;
use App\Models\Street;
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
                'avatarKey' => $h['avatar_key'] ?? 'home',
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
                'pets' => array_map(fn(array $p) => [
                    'id' => (int) $p['id'],
                    'name' => $p['name'],
                    'type' => $p['type'],
                ], Pet::findByHousehold((int) $h['id'])),
                'invites' => array_map([$this, 'toPublicInvite'], HouseholdInvite::findByHousehold((int) $h['id'])),
            ];
        }, Household::findAll());
        Response::json($households);
    }

    public function createHousehold(): void
    {
        $this->requireAdmin();
        $body = Request::json();
        $name = trim($body['name'] ?? '');
        $addressLine = trim($body['addressLine'] ?? '');
        $people = is_array($body['people'] ?? null) ? $body['people'] : [];

        if ($name === '' || $addressLine === '' || count($people) === 0) {
            Response::error('Haushaltsname, Adresse und mindestens eine Person sind Pflicht.', 422);
        }

        $street = Street::first();
        if ($street === null) {
            Response::error('Keine Straße konfiguriert.', 500);
        }

        $householdId = Household::create((int) $street['id'], $name, $addressLine);
        $invites = [];
        foreach ($people as $person) {
            $firstName = trim($person['firstName'] ?? '');
            $lastName = trim($person['lastName'] ?? '');
            if ($firstName === '' || $lastName === '') {
                continue;
            }
            $invites[] = $this->toPublicInvite(HouseholdInvite::create($householdId, $firstName, $lastName));
        }

        Response::json(['householdId' => $householdId, 'invites' => $invites], 201);
    }

    public function addInvite(array $params): void
    {
        $this->requireAdmin();
        $householdId = (int) $params['id'];
        if (Household::findById($householdId) === null) {
            Response::error('Haushalt nicht gefunden.', 404);
        }
        $body = Request::json();
        $firstName = trim($body['firstName'] ?? '');
        $lastName = trim($body['lastName'] ?? '');
        if ($firstName === '' || $lastName === '') {
            Response::error('Vor- und Nachname sind Pflicht.', 422);
        }
        $invite = HouseholdInvite::create($householdId, $firstName, $lastName);
        Response::json($this->toPublicInvite($invite), 201);
    }

    public function revokeInvite(array $params): void
    {
        $this->requireAdmin();
        HouseholdInvite::revoke((int) $params['id']);
        Response::json(null);
    }

    public function updateHousehold(array $params): void
    {
        $this->requireAdmin();
        $householdId = (int) $params['id'];
        if (Household::findById($householdId) === null) {
            Response::error('Haushalt nicht gefunden.', 404);
        }
        $body = Request::json();
        $name = trim($body['name'] ?? '');
        $addressLine = trim($body['addressLine'] ?? '');
        $avatarKey = trim($body['avatarKey'] ?? 'home');
        if ($name === '' || $addressLine === '') {
            Response::error('Haushaltsname und Adresse sind Pflicht.', 422);
        }
        Household::updateDetails($householdId, $name, $addressLine, $avatarKey);
        Response::json(null);
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
            $public['pushSubscribed'] = PushSubscription::hasAny((int) $u['id']);
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
            'expiresAt' => $f['expires_at'],
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

    public function notices(): void
    {
        $this->requireAdmin();
        Response::json(array_map([$this, 'toPublicNotice'], DashboardNotice::findAll()));
    }

    public function createNotice(): void
    {
        $this->requireAdmin();
        $body = Request::json();
        $title = trim($body['title'] ?? '');
        $message = trim($body['message'] ?? '');
        if ($title === '' || $message === '') {
            Response::error('Titel und Nachricht sind Pflicht.', 422);
        }
        Response::json($this->toPublicNotice(DashboardNotice::create($title, $message)), 201);
    }

    public function deleteNotice(array $params): void
    {
        $this->requireAdmin();
        DashboardNotice::delete((int) $params['id']);
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
            'onboardingCompletedAt' => $u['onboarding_completed_at'] ?? null,
            'onboardingCurrentStep' => $u['onboarding_current_step'] ?? 'household',
            'pushSubscribed' => PushSubscription::hasAny((int) $u['id']),
        ];
    }

    private function toPublicInvite(array $i): array
    {
        $usedUserId = $i['used_user_id'] ?? null;

        return [
            'id' => (int) $i['id'],
            'code' => $i['code'],
            'firstName' => $i['first_name'],
            'lastName' => $i['last_name'],
            'usedAt' => $i['used_at'],
            'revokedAt' => $i['revoked_at'] ?? null,
            'usedByUser' => $usedUserId !== null ? [
                'id' => (int) $usedUserId,
                'email' => $i['used_user_email'],
                'displayName' => $i['used_user_display_name'],
                'onboardingCompletedAt' => $i['used_user_onboarding_completed_at'] ?? null,
                'onboardingCurrentStep' => $i['used_user_onboarding_current_step'] ?? 'household',
                'pushSubscribed' => PushSubscription::hasAny((int) $usedUserId),
            ] : null,
        ];
    }

    private function toPublicNotice(array $n): array
    {
        return [
            'id' => (int) $n['id'],
            'title' => $n['title'],
            'message' => $n['message'],
            'isActive' => (bool) $n['is_active'],
            'createdAt' => $n['created_at'],
        ];
    }
}
