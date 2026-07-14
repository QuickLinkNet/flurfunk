<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\Household;
use App\Models\HouseholdInvite;
use App\Models\User;

final class AuthController
{
    // Öffentlich: zeigt vor der eigentlichen Registrierung, für wen der Code
    // gedacht ist (Name + Haushalt), ohne dass man sich schon einloggen muss.
    public function invitePreview(array $params): void
    {
        $invite = HouseholdInvite::findByCode((string) ($params['code'] ?? ''));
        if ($invite === null || $invite['used_at'] !== null || ($invite['revoked_at'] ?? null) !== null) {
            Response::error('Einladungscode ungültig oder bereits verwendet.', 404);
        }
        $household = Household::findById((int) $invite['household_id']);
        Response::json([
            'firstName' => $invite['first_name'],
            'lastName' => $invite['last_name'],
            'householdName' => $household['name'] ?? null,
        ]);
    }

    public function register(): void
    {
        $body = Request::json();
        $email = trim($body['email'] ?? '');
        $password = (string) ($body['password'] ?? '');
        $code = strtoupper(trim($body['code'] ?? ''));

        if ($email === '' || strlen($password) < 8 || $code === '') {
            Response::error('Bitte alle Felder ausfüllen (Passwort mind. 8 Zeichen).', 422);
        }
        if (User::findByEmail($email) !== null) {
            Response::error('Diese E-Mail ist bereits registriert.', 409);
        }
        $invite = HouseholdInvite::findByCode($code);
        if ($invite === null || $invite['used_at'] !== null || ($invite['revoked_at'] ?? null) !== null) {
            Response::error('Einladungscode ungültig oder bereits verwendet.', 422);
        }

        $displayName = trim($invite['first_name'] . ' ' . $invite['last_name']);
        $role = User::adminExists() ? 'member' : 'admin';
        $userId = User::create($email, password_hash($password, PASSWORD_DEFAULT), $displayName, $role);
        User::attachHousehold($userId, (int) $invite['household_id']);
        HouseholdInvite::markUsed((int) $invite['id'], $userId);

        Auth::login($userId);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function login(): void
    {
        $body = Request::json();
        $email = trim($body['email'] ?? '');
        $password = (string) ($body['password'] ?? '');

        $user = User::findByEmail($email);
        if ($user === null || !password_verify($password, $user['password_hash'])) {
            Response::error('E-Mail oder Passwort ist falsch.', 401);
        }

        Auth::login((int) $user['id']);
        Response::json($this->toPublicUser($user));
    }

    public function logout(): void
    {
        Auth::logout();
        Response::json(null);
    }

    public function completeOnboarding(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 422);
        }
        $household = Household::findById((int) $user['household_id']);
        if ($household === null) {
            Response::error('Haushalt nicht gefunden.', 404);
        }
        $missing = [];
        if (trim((string) ($household['name'] ?? '')) === '') {
            $missing[] = 'Haushaltsname';
        }
        if (trim((string) ($household['address_line'] ?? '')) === '') {
            $missing[] = 'Adresse';
        }
        if ($missing !== []) {
            Response::error('Bitte ergänze zuerst: ' . implode(', ', $missing) . '.', 422);
        }
        User::completeOnboarding($userId);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function saveOnboardingProgress(): void
    {
        $userId = Auth::requireLogin();
        $body = Request::json();
        $step = (string) ($body['step'] ?? '');
        if (!in_array($step, ['household', 'family', 'privacy', 'push'], true)) {
            Response::error('Ungültiger Onboarding-Schritt.', 422);
        }
        User::updateOnboardingProgress($userId, $step);
        Response::json($this->toPublicUser(User::findById($userId)));
    }

    public function me(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nutzer nicht gefunden.', 404);
        }
        Response::json($this->toPublicUser($user));
    }

    private function toPublicUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'displayName' => $user['display_name'],
            'role' => $user['role'],
            'householdId' => $user['household_id'] !== null ? (int) $user['household_id'] : null,
            'onboardingCompletedAt' => $user['onboarding_completed_at'] ?? null,
            'onboardingCurrentStep' => $user['onboarding_current_step'] ?? 'household',
        ];
    }
}
