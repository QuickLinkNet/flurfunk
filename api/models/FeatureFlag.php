<?php

namespace App\Models;

use App\Core\Database;

// Admin kann einzelne Funktionsbereiche für die ganze Straße ein-/ausschalten.
final class FeatureFlag
{
    public const FEATURES = ['feed', 'events', 'calendar', 'children', 'pets'];

    public static function findForStreet(int $streetId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT feature_key, enabled FROM feature_flags WHERE street_id = ?'
        );
        $stmt->execute([$streetId]);
        $rows = $stmt->fetchAll();

        $result = [];
        foreach (self::FEATURES as $feature) {
            $result[$feature] = true; // Default: an, bis explizit deaktiviert
        }
        foreach ($rows as $row) {
            $result[$row['feature_key']] = (bool) $row['enabled'];
        }
        return $result;
    }

    public static function upsert(int $streetId, string $feature, bool $enabled): void
    {
        $pdo = Database::pdo();
        $insert = $pdo->prepare(
            'INSERT OR IGNORE INTO feature_flags (street_id, feature_key, enabled) VALUES (?, ?, ?)'
        );
        $insert->execute([$streetId, $feature, $enabled ? 1 : 0]);

        $update = $pdo->prepare(
            'UPDATE feature_flags SET enabled = ? WHERE street_id = ? AND feature_key = ?'
        );
        $update->execute([$enabled ? 1 : 0, $streetId, $feature]);
    }
}
