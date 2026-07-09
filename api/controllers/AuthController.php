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
        $invite = HouseholdInvite::findByCode($params['code'] ?? '');
        if ($invite === null || $invite['used_at'] !== null) {
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
        $code = trim($body['code'] ?? '');

        if ($email === '' || strlen($password) < 8 || $code === '') {
            Response::error('Bitte alle Felder ausfüllen (Passwort mind. 8 Zeichen).', 422);
        }
        if (User::findByEmail($email) !== null) {
            Response::error('Diese E-Mail ist bereits registriert.', 409);
        }
        $invite = HouseholdInvite::findByCode($code);
        if ($invite === null || $invite['used_at'] !== null) {
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
        ];
    }
}
