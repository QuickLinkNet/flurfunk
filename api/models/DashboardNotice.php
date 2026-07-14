<?php

namespace App\Models;

use App\Core\Database;

final class DashboardNotice
{
    public static function latestActive(): ?array
    {
        $stmt = Database::pdo()->query(
            'SELECT * FROM dashboard_notices
             WHERE is_active = 1
             ORDER BY created_at DESC, id DESC
             LIMIT 1'
        );
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    public static function findAll(): array
    {
        return Database::pdo()
            ->query('SELECT * FROM dashboard_notices ORDER BY created_at DESC, id DESC LIMIT 30')
            ->fetchAll();
    }

    public static function create(string $title, string $message): array
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO dashboard_notices (title, message, is_active, created_at)
             VALUES (?, ?, 1, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$title, $message]);
        $id = (int) Database::pdo()->lastInsertId();
        return self::findById($id);
    }

    public static function delete(int $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM dashboard_notices WHERE id = ?');
        $stmt->execute([$id]);
    }

    private static function findById(int $id): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM dashboard_notices WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}
