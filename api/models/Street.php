<?php

namespace App\Models;

use App\Core\Database;

final class Street
{
    // In v1.0 gibt es laut PRD genau eine Straße (Multi-Tenant folgt erst v3.0).
    public static function first(): ?array
    {
        $stmt = Database::pdo()->query('SELECT * FROM streets ORDER BY id LIMIT 1');
        return $stmt->fetch() ?: null;
    }

    public static function findByPublicInviteToken(string $token): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM streets WHERE public_invite_token = ? LIMIT 1');
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }

    // Legt den Link beim ersten Aufruf im Adminbereich automatisch an (lazy),
    // damit kein extra Migrations-Zufall noetig ist. "Erneuern" ruft
    // regeneratePublicInviteToken direkt auf und macht alte Links ungueltig.
    public static function ensurePublicInviteToken(): string
    {
        $street = self::first();
        if ($street === null) {
            throw new \RuntimeException('Keine Straße konfiguriert.');
        }
        if (!empty($street['public_invite_token'])) {
            return (string) $street['public_invite_token'];
        }
        return self::regeneratePublicInviteToken((int) $street['id']);
    }

    public static function regeneratePublicInviteToken(int $streetId): string
    {
        $token = bin2hex(random_bytes(16));
        $stmt = Database::pdo()->prepare('UPDATE streets SET public_invite_token = ? WHERE id = ?');
        $stmt->execute([$token, $streetId]);
        return $token;
    }
}
