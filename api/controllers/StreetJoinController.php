<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Models\Household;
use App\Models\Street;
use App\Models\User;

// Selbstbedienter Beitritt über einen einzigen, wiederverwendbaren
// Straßen-Link (im Unterschied zu den personalisierten Einladungscodes in
// AuthController::register, die pro Person vom Admin/Nachbarn erzeugt
// werden). Bewusst als eigener Controller statt Erweiterung von
// AuthController - beide Wege sollen unabhängig voneinander änderbar
// bleiben, ohne sich gegenseitig zu gefährden.
final class StreetJoinController
{
    public function preview(array $params): void
    {
        $street = $this->requireStreet((string) ($params['token'] ?? ''));
        Response::json([
            'streetName' => $street['name'],
            'households' => array_map(
                fn(array $h) => ['id' => (int) $h['id'], 'name' => $h['name'], 'addressLine' => $h['address_line']],
                Household::findAll()
            ),
        ]);
    }

    public function register(array $params): void
    {
        $street = $this->requireStreet((string) ($params['token'] ?? ''));
        $body = Request::json();

        $displayName = trim((string) ($body['displayName'] ?? ''));
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        $mode = (string) ($body['mode'] ?? '');

        if ($displayName === '' || $email === '' || strlen($password) < 8 || !in_array($mode, ['create', 'join'], true)) {
            Response::error('Bitte alle Felder ausfüllen (Passwort mind. 8 Zeichen).', 422);
        }

        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            if (User::findByEmail($email) !== null) {
                $pdo->rollBack();
                Response::error('Diese E-Mail ist bereits registriert.', 409);
            }

            $householdId = $mode === 'create'
                ? $this->createHousehold((int) $street['id'], $body)
                : $this->resolveExistingHousehold((int) $street['id'], $body);

            $role = User::adminExists() ? 'member' : 'admin';
            $userId = User::create($email, password_hash($password, PASSWORD_DEFAULT), $displayName, $role);
            User::attachHousehold($userId, $householdId);

            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        Auth::login($userId);
        Response::json($this->toPublicUser(User::findById($userId)), 201);
    }

    private function createHousehold(int $streetId, array $body): int
    {
        $name = trim((string) ($body['name'] ?? ''));
        $addressLine = trim((string) ($body['addressLine'] ?? ''));
        if ($name === '' || $addressLine === '') {
            Response::error('Bitte Familiennamen und Adresse angeben.', 422);
        }

        $existing = Household::findByNormalizedNameOrAddress($streetId, $name, $addressLine);
        if ($existing !== null) {
            Response::error(
                'Es gibt schon einen Haushalt mit diesem Namen oder dieser Adresse ("' . $existing['name'] . '"). '
                . 'Bitte stattdessen "Meine Familie ist schon dabei" wählen und beitreten.',
                409
            );
        }

        return Household::create($streetId, $name, $addressLine);
    }

    private function resolveExistingHousehold(int $streetId, array $body): int
    {
        $householdId = (int) ($body['householdId'] ?? 0);
        if ($householdId <= 0) {
            Response::error('Bitte eine Familie zum Beitreten auswählen.', 422);
        }
        $household = Household::findById($householdId);
        if ($household === null || (int) $household['street_id'] !== $streetId) {
            Response::error('Haushalt nicht gefunden.', 404);
        }
        return $householdId;
    }

    private function requireStreet(string $token): array
    {
        if ($token === '') {
            Response::error('Einladungslink ungültig.', 404);
        }
        $street = Street::findByPublicInviteToken($token);
        if ($street === null) {
            Response::error('Einladungslink ungültig oder abgelaufen.', 404);
        }
        return $street;
    }

    private function toPublicUser(?array $user): array
    {
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }
        return [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'displayName' => $user['display_name'],
            'avatarUrl' => $user['avatar_url'] ?? null,
            'role' => $user['role'],
            'householdId' => $user['household_id'] !== null ? (int) $user['household_id'] : null,
            'onboardingCompletedAt' => $user['onboarding_completed_at'] ?? null,
            'onboardingCurrentStep' => $user['onboarding_current_step'] ?? 'household',
            'weeklyDigestEnabled' => (bool) ($user['weekly_digest_enabled'] ?? true),
        ];
    }
}
