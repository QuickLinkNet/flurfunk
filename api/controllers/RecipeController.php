<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\ImageUpload;
use App\Core\Request;
use App\Core\Response;
use App\Models\Recipe;
use App\Models\User;

// Rezepte sind immer fuer die ganze Nachbarschaft sichtbar (keine
// visibility-Stufen wie beim Feed) - jeder eingeloggte Nutzer darf lesen,
// kommentieren und reagieren. Nur Bearbeiten/Loeschen bleibt dem
// erstellenden Haushalt (bzw. Admin) vorbehalten, siehe canManage().
final class RecipeController
{
    public const TAGS = ['schnell', 'familie', 'vegetarisch', 'backen', 'vegan', 'gesund'];
    private const DIFFICULTIES = ['easy', 'medium', 'hard'];

    public function index(): void
    {
        $userId = Auth::requireLogin();
        $tag = $this->normalizeTag($_GET['tag'] ?? null);
        Response::json(array_map([$this, 'toPublicRecipe'], Recipe::findAll($userId, $tag)));
    }

    public function show(array $params): void
    {
        $userId = Auth::requireLogin();
        $recipe = Recipe::findById((int) $params['id'], $userId);
        if ($recipe === null) {
            Response::error('Rezept nicht gefunden.', 404);
        }
        $recipe['comments'] = Recipe::commentsForRecipe((int) $recipe['id']);
        $recipe['comment_count'] = count($recipe['comments']);
        Response::json($this->toPublicRecipe($recipe, true));
    }

    public function store(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }

        $body = Request::json();
        [$title, $description, $ingredients, $steps, $prepMinutes, $servings, $difficulty, $tags] = $this->normalizeInput($body);

        $id = Recipe::create((int) $user['household_id'], $title, $description, $ingredients, $steps, $prepMinutes, $servings, $difficulty);
        Recipe::setTags($id, $tags);
        Response::json(['id' => $id], 201);
    }

    public function update(array $params): void
    {
        $recipeId = (int) $params['id'];
        $this->requireManaged($recipeId);

        $body = Request::json();
        [$title, $description, $ingredients, $steps, $prepMinutes, $servings, $difficulty, $tags] = $this->normalizeInput($body);

        Recipe::update($recipeId, $title, $description, $ingredients, $steps, $prepMinutes, $servings, $difficulty);
        Recipe::setTags($recipeId, $tags);
        Response::json($this->toPublicRecipe(Recipe::findById($recipeId, Auth::userId())));
    }

    public function destroy(array $params): void
    {
        $recipeId = (int) $params['id'];
        $recipe = $this->requireManaged($recipeId);
        $this->deleteOldPhotoFile($recipe);
        Recipe::delete($recipeId);
        Response::json(null);
    }

    public function uploadPhoto(array $params): void
    {
        $recipeId = (int) $params['id'];
        $recipe = $this->requireManaged($recipeId);

        $source = ImageUpload::readUploadedImage($_FILES['photo'] ?? null);
        $filename = $recipeId . '-' . bin2hex(random_bytes(8)) . '.jpg';
        ImageUpload::saveResizedToFit($source, Recipe::photoFilePath($filename));

        $this->deleteOldPhotoFile($recipe);
        Recipe::updatePhoto($recipeId, $filename);
        Response::json(['photoUrl' => Recipe::photoUrl($filename)]);
    }

    public function deletePhoto(array $params): void
    {
        $recipeId = (int) $params['id'];
        $recipe = $this->requireManaged($recipeId);
        $this->deleteOldPhotoFile($recipe);
        Recipe::updatePhoto($recipeId, null);
        Response::json(null);
    }

    public function toggleReaction(array $params): void
    {
        $userId = Auth::requireLogin();
        $recipeId = (int) $params['id'];
        if (Recipe::findById($recipeId) === null) {
            Response::error('Rezept nicht gefunden.', 404);
        }
        $reacted = Recipe::toggleReaction($recipeId, $userId);
        Response::json(['reactedByMe' => $reacted, 'reactionCount' => Recipe::reactionCount($recipeId)]);
    }

    public function addComment(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }
        $recipeId = (int) $params['id'];
        if (Recipe::findById($recipeId) === null) {
            Response::error('Rezept nicht gefunden.', 404);
        }

        $message = trim((string) (Request::json()['message'] ?? ''));
        if ($message === '') {
            Response::error('Kommentar darf nicht leer sein.', 422);
        }
        if ((function_exists('mb_strlen') ? mb_strlen($message) : strlen($message)) > 500) {
            Response::error('Kommentar ist zu lang.', 422);
        }

        Recipe::addComment($recipeId, $userId, $user['household_id'] !== null ? (int) $user['household_id'] : null, $message);
        Response::json(Recipe::commentsForRecipe($recipeId));
    }

    private function requireManaged(int $recipeId): array
    {
        Auth::requireLogin();
        $recipe = Recipe::findById($recipeId);
        if ($recipe === null) {
            Response::error('Rezept nicht gefunden.', 404);
        }
        if (!$this->canManage($recipe)) {
            Response::error('Du kannst nur eigene Rezepte bearbeiten.', 403);
        }
        return $recipe;
    }

    private function normalizeInput(array $body): array
    {
        $title = trim((string) ($body['title'] ?? ''));
        $ingredients = trim((string) ($body['ingredients'] ?? ''));
        $steps = trim((string) ($body['steps'] ?? ''));
        if ($title === '' || $ingredients === '' || $steps === '') {
            Response::error('Titel, Zutaten und Zubereitung sind Pflicht.', 422);
        }

        $description = trim((string) ($body['description'] ?? ''));
        $prepMinutes = is_numeric($body['prepMinutes'] ?? null) ? max(0, (int) $body['prepMinutes']) : null;
        $servings = is_numeric($body['servings'] ?? null) ? max(1, (int) $body['servings']) : null;
        $difficulty = in_array($body['difficulty'] ?? '', self::DIFFICULTIES, true) ? $body['difficulty'] : 'easy';

        $tags = [];
        foreach ((array) ($body['tags'] ?? []) as $tag) {
            if (in_array($tag, self::TAGS, true)) {
                $tags[] = $tag;
            }
        }

        return [$title, $description !== '' ? $description : null, $ingredients, $steps, $prepMinutes, $servings, $difficulty, $tags];
    }

    private function normalizeTag(mixed $tag): ?string
    {
        return is_string($tag) && in_array($tag, self::TAGS, true) ? $tag : null;
    }

    private function deleteOldPhotoFile(array $recipe): void
    {
        $existing = $recipe['photo_path'] ?? null;
        if ($existing === null) {
            return;
        }
        $path = Recipe::photoFilePath($existing);
        if (is_file($path)) {
            @unlink($path);
        }
    }

    private function canManage(array $recipe): bool
    {
        $userId = Auth::userId();
        if ($userId === null) {
            return false;
        }
        $user = User::findById($userId);
        if ($user === null) {
            return false;
        }
        return ($user['role'] ?? '') === 'admin'
            || ($user['household_id'] !== null && (int) $user['household_id'] === (int) $recipe['household_id']);
    }

    private function toPublicRecipe(array $recipe, bool $withComments = false): array
    {
        $tags = !empty($recipe['tags_csv']) ? explode(',', $recipe['tags_csv']) : [];

        $result = [
            'id' => (int) $recipe['id'],
            'title' => $recipe['title'],
            'description' => $recipe['description'],
            'ingredients' => $recipe['ingredients'],
            'steps' => $recipe['steps'],
            'photoUrl' => Recipe::photoUrl($recipe['photo_path'] ?? null),
            'prepMinutes' => $recipe['prep_minutes'] !== null ? (int) $recipe['prep_minutes'] : null,
            'servings' => $recipe['servings'] !== null ? (int) $recipe['servings'] : null,
            'difficulty' => $recipe['difficulty'],
            'tags' => $tags,
            'householdName' => $recipe['household_name'],
            'householdAvatarKey' => $recipe['household_avatar_key'],
            'createdAt' => $recipe['created_at'],
            'commentCount' => (int) ($recipe['comment_count'] ?? 0),
            'reactionCount' => (int) ($recipe['reaction_count'] ?? 0),
            'reactedByMe' => ((int) ($recipe['reacted_by_me'] ?? 0)) === 1,
            'canManage' => $this->canManage($recipe),
        ];
        if ($withComments) {
            $result['comments'] = array_map(fn(array $c) => [
                'id' => (int) $c['id'],
                'householdName' => $c['household_name'] ?? null,
                'authorName' => $c['author_name'],
                'message' => $c['message'],
                'createdAt' => $c['created_at'],
            ], $recipe['comments'] ?? []);
        }
        return $result;
    }
}
