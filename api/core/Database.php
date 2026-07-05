<?php

namespace App\Core;

use PDO;
use PDOException;

// Native PDO-Verbindung zu SQLite als einfaches Singleton. Keine ORM-Bibliothek.
// SQLite reicht für eine einzelne Straße (5-40 Haushalte) locker aus und
// erspart einen separaten Datenbank-Server beim Hoster (siehe README).
final class Database
{
    private static ?PDO $instance = null;

    public static function pdo(): PDO
    {
        if (self::$instance === null) {
            $config = require __DIR__ . '/../config.php';
            try {
                self::$instance = new PDO('sqlite:' . $config['db']['path'], null, null, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                self::$instance->exec('PRAGMA foreign_keys = ON');
                self::runMigrations(self::$instance);
            } catch (PDOException $e) {
                throw new PDOException('Datenbankverbindung fehlgeschlagen: ' . $e->getMessage());
            }
        }
        return self::$instance;
    }

    // Führt bei jedem Request noch nicht angewendete Migrationen aus
    // migrations/*.sql aus. Erspart den manuellen phpMyAdmin-Schritt aus
    // der MySQL-Zeit – SQLite ist nur eine Datei, die Tabellen entstehen
    // beim ersten echten Request von selbst.
    private static function runMigrations(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS _migrations (
                filename TEXT PRIMARY KEY,
                applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )'
        );
        $applied = $pdo->query('SELECT filename FROM _migrations')->fetchAll(PDO::FETCH_COLUMN);

        $files = glob(__DIR__ . '/../migrations/*.sql') ?: [];
        sort($files);
        foreach ($files as $file) {
            $filename = basename($file);
            if (in_array($filename, $applied, true)) {
                continue;
            }
            $pdo->exec((string) file_get_contents($file));
            $stmt = $pdo->prepare('INSERT INTO _migrations (filename) VALUES (?)');
            $stmt->execute([$filename]);
        }
    }
}
