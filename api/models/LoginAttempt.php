<?php

namespace App\Models;

use App\Core\Database;

// Einfacher Brute-Force-Schutz ohne externe Abhaengigkeit (kein Redis auf
// Shared Hosting verfuegbar): Fehlversuche pro E-Mail und pro IP werden in
// einem gleitenden Zeitfenster gezaehlt. E-Mail-Limit schuetzt ein
// einzelnes Konto vor gezieltem Raten, IP-Limit schuetzt vor einer Quelle,
// die viele verschiedene Konten durchprobiert.
final class LoginAttempt
{
    private const EMAIL_LIMIT = 5;
    private const IP_LIMIT = 20;
    private const WINDOW_MINUTES = 15;

    public static function isBlocked(string $email, string $ip): bool
    {
        $normalizedEmail = self::normalize($email);
        return self::countRecent('email', $normalizedEmail) >= self::EMAIL_LIMIT
            || self::countRecent('ip_address', $ip) >= self::IP_LIMIT;
    }

    public static function recordFailure(string $email, string $ip): void
    {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('INSERT INTO login_attempts (email, ip_address, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
        $stmt->execute([self::normalize($email), $ip]);

        // Beilaeufiges Aufraeumen alter Eintraege, kein Cron noetig.
        $pdo->exec("DELETE FROM login_attempts WHERE created_at < datetime('now', '-1 day')");
    }

    public static function clear(string $email): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM login_attempts WHERE email = ?');
        $stmt->execute([self::normalize($email)]);
    }

    private static function countRecent(string $column, string $value): int
    {
        $stmt = Database::pdo()->prepare(
            "SELECT COUNT(*) FROM login_attempts WHERE $column = ? AND created_at > datetime('now', ?)"
        );
        $stmt->execute([$value, '-' . self::WINDOW_MINUTES . ' minutes']);
        return (int) $stmt->fetchColumn();
    }

    private static function normalize(string $email): string
    {
        return strtolower(trim($email));
    }
}
