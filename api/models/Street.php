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
}
