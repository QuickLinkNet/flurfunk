<?php

namespace App\Core;

// Schlanker Zugriff auf Methode, Pfad und JSON-Body der Anfrage.
final class Request
{
    private static ?array $jsonBody = null;

    public static function method(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public static function path(): string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        $base = '/apps/neighborhood/api';
        if (str_starts_with($uri, $base)) {
            $uri = substr($uri, strlen($base));
        }
        return '/' . ltrim($uri, '/');
    }

    public static function json(): array
    {
        if (self::$jsonBody === null) {
            $raw = file_get_contents('php://input') ?: '';
            self::$jsonBody = json_decode($raw, true) ?: [];
        }
        return self::$jsonBody;
    }
}
