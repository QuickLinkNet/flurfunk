<?php

namespace App\Core;

// PHP-native Session-Auth. Kein JWT nötig, da Frontend + API im Live-Betrieb
// auf derselben Domain liegen.
final class Auth
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            $config = require __DIR__ . '/../config.php';
            session_name($config['session_name']);
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => Cors::isCrossOriginDevRequest() ? 'None' : 'Lax',
            ]);
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
