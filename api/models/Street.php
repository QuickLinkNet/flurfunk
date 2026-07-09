<?php

namespace App\Models;

use App\Core\Database;

final class Street
{
    public static function findByInviteCode(string $inviteCode): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM streets WHERE invite_code = ? LIMIT 1');
        $stmt->execute([$inviteCode]);
        return $stmt->fetch() ?: null;
    }

    // In v1.0 gibt es laut PRD genau eine Straße (Multi-Tenant folgt erst v3.0).
    public static function first(): ?array
    {
        $stmt = Database::pdo()->query('SELECT * FROM streets ORDER BY id LIMIT 1');
        return $stmt->fetch() ?: null;
    }
}
