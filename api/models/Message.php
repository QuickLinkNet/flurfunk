<?php

namespace App\Models;

use App\Core\Database;

final class Message
{
    private const MAX_LENGTH = 2000;

    public static function create(int $conversationId, int $senderUserId, string $body): array
    {
        $body = mb_substr(trim($body), 0, self::MAX_LENGTH);
        $stmt = Database::pdo()->prepare(
            'INSERT INTO messages (conversation_id, sender_user_id, body, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([$conversationId, $senderUserId, $body]);
        $id = (int) Database::pdo()->lastInsertId();

        Conversation::touchLastMessageAt($conversationId);

        return self::findById($id) ?? throw new \RuntimeException('Nachricht konnte nicht gespeichert werden.');
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT m.*, u.display_name AS sender_display_name
             FROM messages m
             JOIN users u ON u.id = m.sender_user_id
             WHERE m.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByConversation(int $conversationId, int $limit = 200): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT m.*, u.display_name AS sender_display_name
             FROM messages m
             JOIN users u ON u.id = m.sender_user_id
             WHERE m.conversation_id = ?
             ORDER BY m.created_at ASC, m.id ASC
             LIMIT ?'
        );
        $stmt->bindValue(1, $conversationId, \PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
