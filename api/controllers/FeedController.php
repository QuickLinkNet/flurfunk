<?php

namespace App\Controllers;

use App\Core\Auth;
use App\Core\PushService;
use App\Core\Request;
use App\Core\Response;
use App\Models\FeedItem;
use App\Models\Household;
use App\Models\User;

final class FeedController
{
    public function index(): void
    {
        $userId = Auth::userId();
        $viewerRole = $userId !== null ? (User::findById($userId)['role'] ?? 'guest') : 'guest';
        Response::json(array_map([$this, 'toPublicItem'], FeedItem::findVisible($viewerRole, $userId)));
    }

    public function store(): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null || $user['household_id'] === null) {
            Response::error('Kein Haushalt zugeordnet.', 404);
        }
        $body = Request::json();
        $type = $body['type'] ?? '';
        if (!in_array($type, FeedItem::MVP_TYPES, true)) {
            Response::error('Unbekannter Post-Typ.', 422);
        }
        $visibility = in_array($body['visibility'] ?? '', ['public', 'neighbors', 'private'], true)
            ? $body['visibility']
            : 'neighbors';

        $expiresAt = $this->normalizeExpiresAt($body['expiresAt'] ?? null);
        $message = $this->normalizeMessage($body['message'] ?? null);
        $id = FeedItem::create(
            (int) $user['household_id'],
            $type,
            $message,
            $visibility,
            $expiresAt
        );

        $push = null;
        if ($visibility !== 'private') {
            try {
                $household = Household::findById((int) $user['household_id']);
                $householdName = $household['name'] ?? 'Ein Nachbar';
                $push = PushService::sendFeedUpdate($userId, [
                    'title' => 'Flurfunk: ' . $householdName,
                    'body' => $message !== null ? $this->truncateMessage($message, 120) : 'Neue Meldung in der Straße.',
                    'url' => '/apps/neighborhood/strasse',
                ]);
            } catch (\Throwable $e) {
                error_log('Feed push failed: ' . $e->getMessage());
            }
        }

        Response::json(['id' => $id, 'push' => $push], 201);
    }

    public function toggleReaction(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $itemId = (int) $params['id'];
        if (FeedItem::findVisibleById($itemId, $user['role'] ?? 'guest') === null) {
            Response::error('Meldung nicht gefunden.', 404);
        }

        $reacted = FeedItem::toggleReaction($itemId, $userId);
        Response::json([
            'reactedByMe' => $reacted,
            'reactionCount' => FeedItem::reactionCount($itemId),
        ]);
    }

    public function addComment(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $itemId = (int) $params['id'];
        if (FeedItem::findVisibleById($itemId, $user['role'] ?? 'guest') === null) {
            Response::error('Meldung nicht gefunden.', 404);
        }

        $body = Request::json();
        $message = trim((string) ($body['message'] ?? ''));
        if ($message === '') {
            Response::error('Kommentar darf nicht leer sein.', 422);
        }
        $messageLength = function_exists('mb_strlen') ? mb_strlen($message) : strlen($message);
        if ($messageLength > 500) {
            Response::error('Kommentar ist zu lang.', 422);
        }

        FeedItem::addComment($itemId, $userId, $user['household_id'] !== null ? (int) $user['household_id'] : null, $message);
        Response::json(array_map([$this, 'toPublicComment'], FeedItem::commentsForItem($itemId)), 201);
    }

    public function toggleHelper(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $itemId = (int) $params['id'];
        $item = FeedItem::findVisibleById($itemId, $user['role'] ?? 'guest');
        if ($item === null) {
            Response::error('Meldung nicht gefunden.', 404);
        }
        if (!in_array($item['type'], ['help_needed', 'babysitter_needed'], true)) {
            Response::error('Für diese Meldung gibt es keine Hilfe-Zusage.', 422);
        }

        $helping = FeedItem::toggleHelper($itemId, $userId, $user['household_id'] !== null ? (int) $user['household_id'] : null);
        Response::json([
            'helpingByMe' => $helping,
            'helpers' => array_map([$this, 'toPublicHelper'], FeedItem::helpersForItem($itemId)),
        ]);
    }

    public function borrowItem(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $itemId = (int) $params['id'];
        $item = FeedItem::findVisibleById($itemId, $user['role'] ?? 'guest');
        if ($item === null) {
            Response::error('Meldung nicht gefunden.', 404);
        }
        if ($item['type'] !== 'tool_available') {
            Response::error('Für diese Meldung gibt es keinen Ausleih-Status.', 422);
        }

        $borrowed = FeedItem::borrow($itemId, $userId, $user['household_id'] !== null ? (int) $user['household_id'] : null);
        if (!$borrowed) {
            Response::error('Ist bereits ausgeliehen.', 409);
        }

        Response::json(['loan' => $this->toPublicLoan(FeedItem::activeLoanForItem($itemId))]);
    }

    public function returnItem(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $itemId = (int) $params['id'];
        $item = FeedItem::findVisibleById($itemId, $user['role'] ?? 'guest');
        if ($item === null) {
            Response::error('Meldung nicht gefunden.', 404);
        }

        $loan = FeedItem::activeLoanForItem($itemId);
        $isBorrower = $loan !== null && (int) $loan['user_id'] === $userId;
        $isOwner = $user['household_id'] !== null && (int) $user['household_id'] === (int) $item['household_id'];
        if (!$isBorrower && !$isOwner && ($user['role'] ?? '') !== 'admin') {
            Response::error('Nur der Ausleiher oder Eigentümer kann als zurückgegeben markieren.', 403);
        }

        FeedItem::returnLoan($itemId);
        Response::json(['loan' => null]);
    }

    public function updateStatus(array $params): void
    {
        $userId = Auth::requireLogin();
        $user = User::findById($userId);
        if ($user === null) {
            Response::error('Nicht angemeldet.', 401);
        }

        $itemId = (int) $params['id'];
        $item = FeedItem::findVisibleById($itemId, $user['role'] ?? 'guest');
        if ($item === null) {
            Response::error('Meldung nicht gefunden.', 404);
        }
        $isOwner = $user['household_id'] !== null && (int) $user['household_id'] === (int) $item['household_id'];
        if (($user['role'] ?? '') !== 'admin' && !$isOwner) {
            Response::error('Du kannst nur eigene Meldungen ändern.', 403);
        }

        $body = Request::json();
        $status = (string) ($body['status'] ?? '');
        if (!in_array($status, ['open', 'done'], true)) {
            Response::error('Ungültiger Status.', 422);
        }

        FeedItem::updateStatus($itemId, $status);
        Response::json(['status' => $status]);
    }

    private function canManage(array $item): bool
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
            || ($user['household_id'] !== null && (int) $user['household_id'] === (int) $item['household_id']);
    }

    private function toPublicItem(array $item): array
    {
        $userId = Auth::userId();
        $helpers = in_array($item['type'], ['help_needed', 'babysitter_needed'], true)
            ? FeedItem::helpersForItem((int) $item['id'])
            : [];
        $loan = $item['type'] === 'tool_available' ? FeedItem::activeLoanForItem((int) $item['id']) : null;

        return [
            'id' => (int) $item['id'],
            'householdName' => $item['household_name'],
            'type' => $item['type'],
            'message' => $item['message'],
            'visibility' => $item['visibility'],
            'status' => $item['status'] ?? 'open',
            'canManage' => $this->canManage($item),
            'createdAt' => $item['created_at'],
            'expiresAt' => $item['expires_at'],
            'reactionCount' => (int) ($item['reaction_count'] ?? 0),
            'reactedByMe' => ((int) ($item['reacted_by_me'] ?? 0)) === 1,
            'comments' => array_map([$this, 'toPublicComment'], FeedItem::commentsForItem((int) $item['id'])),
            'helpers' => array_map([$this, 'toPublicHelper'], $helpers),
            'helpingByMe' => $userId !== null && in_array($userId, array_map(fn(array $h) => (int) $h['user_id'], $helpers), true),
            'loan' => $this->toPublicLoan($loan),
            'loanedByMe' => $userId !== null && $loan !== null && (int) $loan['user_id'] === $userId,
        ];
    }

    private function toPublicComment(array $comment): array
    {
        return [
            'id' => (int) $comment['id'],
            'householdName' => $comment['household_name'] ?? null,
            'authorName' => $comment['author_name'],
            'message' => $comment['message'],
            'createdAt' => $comment['created_at'],
        ];
    }

    private function toPublicHelper(array $helper): array
    {
        return [
            'id' => (int) $helper['id'],
            'householdName' => $helper['household_name'] ?? null,
            'createdAt' => $helper['created_at'],
        ];
    }

    private function toPublicLoan(?array $loan): ?array
    {
        if ($loan === null) {
            return null;
        }
        return [
            'householdName' => $loan['household_name'] ?? null,
            'borrowedAt' => $loan['borrowed_at'],
        ];
    }

    private function normalizeMessage(mixed $message): ?string
    {
        $normalized = trim((string) ($message ?? ''));
        return $normalized !== '' ? $normalized : null;
    }

    private function truncateMessage(string $message, int $maxLength): string
    {
        $length = function_exists('mb_strlen') ? mb_strlen($message) : strlen($message);
        if ($length <= $maxLength) {
            return $message;
        }
        $truncated = function_exists('mb_substr') ? mb_substr($message, 0, $maxLength) : substr($message, 0, $maxLength);
        return $truncated . '…';
    }

    private function normalizeExpiresAt(mixed $expiresAt): ?string
    {
        $normalized = trim((string) ($expiresAt ?? ''));
        if ($normalized === '') {
            return null;
        }
        $timestamp = strtotime($normalized);
        return $timestamp !== false ? date('Y-m-d H:i:s', $timestamp) : null;
    }
}
