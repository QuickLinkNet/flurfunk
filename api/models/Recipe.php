<?php

namespace App\Models;

use App\Core\Database;

// Rezepte: siehe Migration 045 fuer den Grund, warum das eine eigene Tabelle
// ist statt ein feed_items-Typ. Immer nachbarschaftsweit sichtbar, keine
// visibility-Spalte.
final class Recipe
{
    private const PHOTO_URL_PREFIX = '/apps/neighborhood/api/uploads/recipes/';

    public static function photoFilePath(string $filename): string
    {
        return __DIR__ . '/../uploads/recipes/' . $filename;
    }

    public static function photoUrl(?string $filename): ?string
    {
        return $filename !== null ? self::PHOTO_URL_PREFIX . $filename : null;
    }

    // $tag: optionaler Filter auf genau einen Tag (siehe RecipeController::TAGS).
    public static function findAll(?int $viewerUserId, ?string $tag = null): array
    {
        $sql = 'SELECT r.*, h.name AS household_name, h.avatar_key AS household_avatar_key,
                   GROUP_CONCAT(DISTINCT rt.tag) AS tags_csv,
                   COUNT(DISTINCT rc.id) AS comment_count,
                   COUNT(DISTINCT rr.id) AS reaction_count,
                   MAX(CASE WHEN rr.user_id = ? THEN 1 ELSE 0 END) AS reacted_by_me
            FROM recipes r
            JOIN households h ON h.id = r.household_id
            LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
            LEFT JOIN recipe_comments rc ON rc.recipe_id = r.id
            LEFT JOIN recipe_reactions rr ON rr.recipe_id = r.id';
        $params = [$viewerUserId ?? 0];
        if ($tag !== null) {
            $sql .= ' WHERE r.id IN (SELECT recipe_id FROM recipe_tags WHERE tag = ?)';
            $params[] = $tag;
        }
        $sql .= ' GROUP BY r.id ORDER BY r.created_at DESC';

        $stmt = Database::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function findById(int $id, ?int $viewerUserId = null): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT r.*, h.name AS household_name, h.avatar_key AS household_avatar_key,
                    GROUP_CONCAT(DISTINCT rt.tag) AS tags_csv,
                    COUNT(DISTINCT rr.id) AS reaction_count,
                    MAX(CASE WHEN rr.user_id = ? THEN 1 ELSE 0 END) AS reacted_by_me
             FROM recipes r
             JOIN households h ON h.id = r.household_id
             LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
             LEFT JOIN recipe_reactions rr ON rr.recipe_id = r.id
             WHERE r.id = ?
             GROUP BY r.id'
        );
        $stmt->execute([$viewerUserId ?? 0, $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(
        int $householdId,
        string $title,
        ?string $description,
        string $ingredients,
        string $steps,
        ?int $prepMinutes,
        ?int $servings,
        string $difficulty
    ): int {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO recipes (household_id, title, description, ingredients, steps, prep_minutes, servings, difficulty, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$householdId, $title, $description, $ingredients, $steps, $prepMinutes, $servings, $difficulty]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function update(
        int $id,
        string $title,
        ?string $description,
        string $ingredients,
        string $steps,
        ?int $prepMinutes,
        ?int $servings,
        string $difficulty
    ): void {
        $stmt = Database::pdo()->prepare(
            'UPDATE recipes SET title = ?, description = ?, ingredients = ?, steps = ?, prep_minutes = ?, servings = ?, difficulty = ? WHERE id = ?'
        );
        $stmt->execute([$title, $description, $ingredients, $steps, $prepMinutes, $servings, $difficulty, $id]);
    }

    public static function setTags(int $recipeId, array $tags): void
    {
        $pdo = Database::pdo();
        $pdo->prepare('DELETE FROM recipe_tags WHERE recipe_id = ?')->execute([$recipeId]);
        $insert = $pdo->prepare('INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)');
        foreach (array_unique($tags) as $tag) {
            $insert->execute([$recipeId, $tag]);
        }
    }

    public static function updatePhoto(int $id, ?string $filename): void
    {
        $stmt = Database::pdo()->prepare('UPDATE recipes SET photo_path = ? WHERE id = ?');
        $stmt->execute([$filename, $id]);
    }

    public static function delete(int $id): void
    {
        Database::pdo()->prepare('DELETE FROM recipes WHERE id = ?')->execute([$id]);
    }

    public static function commentsForRecipe(int $recipeId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT rc.*, h.name AS household_name, u.display_name AS author_name
             FROM recipe_comments rc
             JOIN users u ON u.id = rc.user_id
             LEFT JOIN households h ON h.id = rc.household_id
             WHERE rc.recipe_id = ?
             ORDER BY rc.created_at ASC
             LIMIT 100'
        );
        $stmt->execute([$recipeId]);
        return $stmt->fetchAll();
    }

    public static function addComment(int $recipeId, int $userId, ?int $householdId, string $message): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO recipe_comments (recipe_id, user_id, household_id, message, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$recipeId, $userId, $householdId, $message]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function toggleReaction(int $recipeId, int $userId): bool
    {
        $pdo = Database::pdo();
        $existing = $pdo->prepare('SELECT id FROM recipe_reactions WHERE recipe_id = ? AND user_id = ? LIMIT 1');
        $existing->execute([$recipeId, $userId]);
        $reactionId = $existing->fetchColumn();
        if ($reactionId !== false) {
            $pdo->prepare('DELETE FROM recipe_reactions WHERE id = ?')->execute([(int) $reactionId]);
            return false;
        }
        $pdo->prepare('INSERT INTO recipe_reactions (recipe_id, user_id) VALUES (?, ?)')->execute([$recipeId, $userId]);
        return true;
    }

    public static function reactionCount(int $recipeId): int
    {
        $stmt = Database::pdo()->prepare('SELECT COUNT(*) FROM recipe_reactions WHERE recipe_id = ?');
        $stmt->execute([$recipeId]);
        return (int) $stmt->fetchColumn();
    }

    public static function reactedByUser(int $recipeId, int $userId): bool
    {
        $stmt = Database::pdo()->prepare('SELECT 1 FROM recipe_reactions WHERE recipe_id = ? AND user_id = ? LIMIT 1');
        $stmt->execute([$recipeId, $userId]);
        return (bool) $stmt->fetchColumn();
    }
}
