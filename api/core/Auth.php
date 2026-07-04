<?php

namespace App\Core;

// PHP-native Session-Auth. Kein JWT nötig, da Frontend + API auf
// derselben Domain liegen (siehe PRD Kapitel 9.4).
final class Auth
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            $config = require __DIR__ . '/../config.php';
            session_name($config['session_name']);
            session_start();
        }
    }

    public static function login(int $userId): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        session_destroy();
    }

    public static function userId(): ?int
    {
        return $_SESSION['user_id'] ?? null;
    }

    public static function requireLogin(): int
    {
        $id = self::userId();
        if ($id === null) {
            Response::error('Nicht angemeldet.', 401);
        }
        return $id;
    }
}
