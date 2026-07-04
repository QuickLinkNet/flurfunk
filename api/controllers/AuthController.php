<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\Household;
use App\Models\Street;
use App\Models\User;

final class AuthController
{
    public function register(): void
    {
        $body = Request::json();
        $email = trim($body['email'] ?? '');
        $password = (string) ($body['password'] ?? '');
        $displayName = trim($body['displayName'] ?? '');
        $inviteCode = trim($body['inviteCode'] ?? '');
        $householdName = trim($body['householdName'] ?? '');
        $addressLine = trim($body['addressLine'] ?? '');

        if ($email === '' || strlen($password) < 8 || $displayName === '' || $inviteCode === ''
            || $householdName === '' || $addressLine === ''
        ) {
            Response::error('Bitte alle Felder ausfüllen (Passwort mind. 8 Zeichen).', 422);
        }
        if (User::findByEmail($email) !== null) {
            Response::error('Diese E-Mail ist bereits registriert.', 409);
        }
        $street = Street::findByInviteCode($inviteCode);
        if ($street === null) {
            Response::error('Ungültiger Einladungscode.', 422);
        }

        $role = User::adminExists() ? 'member' : 'admin';
        $userId = User::create($email, password_hash($password, PASSWORD_DEFAULT), $displayName, $role);
        $householdId = Household::create((int) $street['id'], $householdName, $addressLine);
        User::attachHousehold($userId, $householdId);

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
