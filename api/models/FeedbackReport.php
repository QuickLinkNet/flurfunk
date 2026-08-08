<?php

namespace App\Models;

use App\Core\Database;

final class FeedbackReport
{
    public const CATEGORIES = ['bug', 'idea', 'other'];

    public static function create(int $userId, ?int $householdId, string $category, string $message, ?string $pagePath): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO feedback_reports (user_id, household_id, category, message, page_path, status, created_at)
             VALUES (?, ?, ?, ?, ?, \'open\', CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$userId, $householdId, $category, $message, $pagePath]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function findAll(): array
    {
        return Database::pdo()->query(
            'SELECT fr.*, u.display_name AS reporter_name, h.name AS household_name
             FROM feedback_reports fr
             JOIN users u ON u.id = fr.user_id
             LEFT JOIN households h ON h.id = fr.household_id
             ORDER BY fr.created_at DESC, fr.id DESC'
        )->fetchAll();
    }

    public static function updateStatus(int $id, string $status): void
    {
        $stmt = Database::pdo()->prepare('UPDATE feedback_reports SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
    }

    public static function delete(int $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM feedback_reports WHERE id = ?');
        $stmt->execute([$id]);
    }

    public static function openCount(): int
    {
        $stmt = Database::pdo()->query("SELECT COUNT(*) FROM feedback_reports WHERE status = 'open'");
        return (int) $stmt->fetchColumn();
    }
}
