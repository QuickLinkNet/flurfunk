<?php

namespace App\Core;

final class Cors
{
    public static function apply(): void
    {
        // CORS response headers are set in api/.htaccess so they can replace
        // hosting-level wildcard headers before the response leaves Apache.
    }

    public static function handlePreflight(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'OPTIONS') {
            return;
        }

        http_response_code(204);
        exit;
    }

    public static function isCrossOriginDevRequest(): bool
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        return self::isLocalDevOrigin($origin);
    }

    private static function isLocalDevOrigin(string $origin): bool
    {
        $parts = parse_url($origin);
        if (($parts['scheme'] ?? '') !== 'http') {
            return false;
        }

        return in_array($parts['host'] ?? '', ['localhost', '127.0.0.1'], true)
            && isset($parts['port']);
    }
}
