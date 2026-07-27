<?php

namespace App\Core;

// PHP-native Session-Auth. Kein JWT nötig, da Frontend + API im Live-Betrieb
// auf derselben Domain liegen.
final class Auth
{
    // "Angemeldet bleiben" - Standard ist an, damit Nutzer nach dem ersten
    // Ausprobieren nicht bei jedem Besuch neu einloggen müssen.
    private const REMEMBER_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            $config = require __DIR__ . '/../config.php';
            session_name($config['session_name']);
            // Server muss die Session mindestens so lange vorhalten wie das
            // Cookie gültig sein kann, sonst wirkt "eingeloggt bleiben" nicht.
            ini_set('session.gc_maxlifetime', (string) self::REMEMBER_LIFETIME_SECONDS);
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

    public static function login(int $userId, bool $remember = true): void
    {
        session_set_cookie_params([
            'lifetime' => $remember ? self::REMEMBER_LIFETIME_SECONDS : 0,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => Cors::isCrossOriginDevRequest() ? 'None' : 'Lax',
        ]);
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
