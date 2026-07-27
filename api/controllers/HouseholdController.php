<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Models\Child;
use App\Models\Household;
use App\Models\User;
use App\Models\VisibilitySetting;

final class HouseholdController
{
    public function index(): void
    {
        $userId = Auth::userId();
        $viewerRole = $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';
        $households = Household::findVisibleFor($viewerRole);
        Response::json(array_map([$this, 'toPublicHousehold'], $households));
    }

    public function me(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $household = Household::findById((int) $user['household_id']);
        Response::json($this->toPublicHousehold($household));
    }

    public function neighbors(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $viewerHouseholdId = $user['household_id'] !== null ? (int) $user['household_id'] : null;
        $households = Household::findAll();
        Response::json(array_map(
            fn(array $household) => $this->toNeighborHousehold($household, $viewerHouseholdId),
            $households
        ));
    }

    public function updateMe(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }

        $body = Request::json();
        $householdId = (int) $user['household_id'];

        if (isset($body['name']) || isset($body['addressLine']) || isset($body['avatarKey'])) {
            $name = trim($body['name'] ?? '');
            $addressLine = trim($body['addressLine'] ?? '');
            $avatarKey = trim($body['avatarKey'] ?? 'home');
            if ($name === '' || $addressLine === '') {
                Response::error('Haushaltsname und Adresse sind Pflicht.', 422);
            }
            Household::updateDetails($householdId, $name, $addressLine, $avatarKey);
        }

        if (isset($body['statusEmoji']) || isset($body['statusLabel']) || array_key_exists('statusNote', $body)) {
            Household::updateStatus(
                $householdId,
                $body['statusEmoji'] ?? '🏠',
                $body['statusLabel'] ?? 'Zuhause',
                $body['statusNote'] ?? null
            );
        }

        if (array_key_exists('contactNote', $body)) {
            $contactNote = trim((string) ($body['contactNote'] ?? ''));
            Household::updateContactNote($householdId, $contactNote !== '' ? $contactNote : null);
        }

        Response::json($this->toPublicHousehold(Household::findById($householdId)));
    }

    private function toPublicHousehold(array $h): array
    {
        return [
            'id' => (int) $h['id'],
            'name' => $h['name'],
            'addressLine' => $h['address_line'],
            'avatarKey' => $h['avatar_key'] ?? 'home',
            'statusEmoji' => $h['status_emoji'],
            'statusLabel' => $h['status_label'],
            'statusNote' => $h['status_note'],
            'statusUpdatedAt' => $h['status_updated_at'],
            'contactNote' => $h['contact_note'] ?? null,
        ];
    }

    private function toNeighborHousehold(array $h, ?int $viewerHouseholdId): array
    {
        $householdId = (int) $h['id'];
        $isOwnHousehold = $viewerHouseholdId !== null && $viewerHouseholdId === $householdId;
        $visibility = VisibilitySetting::findForHousehold($householdId);

        return [
            'id' => $householdId,
            'name' => $h['name'],
            'addressLine' => $h['address_line'],
            'avatarKey' => $h['avatar_key'] ?? 'home',
            'isOwnHousehold' => $isOwnHousehold,
            'statusVisible' => $this->isFieldVisible($visibility['status'], $isOwnHousehold),
            'vacationVisible' => $this->isFieldVisible($visibility['vacation'], $isOwnHousehold),
            'childrenVisible' => $this->isFieldVisible($visibility['children_location'], $isOwnHousehold),
            'eventsVisible' => $this->isFieldVisible($visibility['events'], $isOwnHousehold),
            'contactVisible' => $this->isFieldVisible($visibility['contact'], $isOwnHousehold),
            'status' => $this->isFieldVisible($visibility['status'], $isOwnHousehold) ? [
                'emoji' => $h['status_emoji'],
                'label' => $h['status_label'],
                'note' => $h['status_note'],
                'updatedAt' => $h['status_updated_at'],
            ] : null,
            'vacation' => $this->vacationInfo($h, $visibility['vacation'], $isOwnHousehold),
            'children' => $this->isFieldVisible($visibility['children_location'], $isOwnHousehold)
                ? array_map([$this, 'toNeighborChild'], Child::findByHousehold($householdId))
                : [],
            'events' => $this->isFieldVisible($visibility['events'], $isOwnHousehold)
                ? $this->upcomingEventsForHousehold($householdId)
                : [],
            'contact' => $this->isFieldVisible($visibility['contact'], $isOwnHousehold)
                ? ($h['contact_note'] ?? null)
                : null,
        ];
    }

    private function isFieldVisible(string $visibility, bool $isOwnHousehold): bool
    {
        return $isOwnHousehold || in_array($visibility, ['public', 'neighbors'], true);
    }

    private function vacationInfo(array $h, string $visibility, bool $isOwnHousehold): ?array
    {
        if (!$this->isFieldVisible($visibility, $isOwnHousehold)) {
            return null;
        }
        $text = strtolower((string) $h['status_label'] . ' ' . (string) ($h['status_note'] ?? ''));
        if (!str_contains($text, 'urlaub')) {
            return null;
        }
        return [
            'label' => $h['status_label'],
            'note' => $h['status_note'],
        ];
    }

    private function toNeighborChild(array $child): array
    {
        return [
            'id' => (int) $child['id'],
            'name' => $child['name'],
            'currentLocation' => $child['current_location'],
            'locationNote' => $child['location_note'],
            'updatedAt' => $child['updated_at'],
        ];
    }

    private function upcomingEventsForHousehold(int $householdId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT id, title, location, starts_at, ends_at
             FROM events
             WHERE creator_household_id = ?
               AND visibility IN ("public", "neighbors")
               AND ((ends_at IS NULL AND starts_at >= ?) OR (ends_at IS NOT NULL AND ends_at >= ?))
             ORDER BY starts_at ASC
             LIMIT 3'
        );
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $stmt->execute([$householdId, $now, $now]);
        return array_map(fn(array $event) => [
            'id' => (int) $event['id'],
            'title' => $event['title'],
            'location' => $event['location'],
            'startsAt' => $event['starts_at'],
            'endsAt' => $event['ends_at'],
        ], $stmt->fetchAll());
    }
}
