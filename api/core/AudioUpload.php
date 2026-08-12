<?php

namespace App\Core;

// Upload-Handling fuer Sprachnachrichten. Anders als ImageUpload gibt es
// serverseitig keine Bildbearbeitungs-Bibliothek fuer Audio (kein ffmpeg auf
// dem Shared Hosting) - die Datei wird unveraendert gespeichert, nur Groesse
// und (client-gemeldeter) MIME-Typ werden geprueft. Die .htaccess in
// api/uploads/ verhindert unabhaengig davon jede PHP-Ausfuehrung dort.
final class AudioUpload
{
    private const MAX_BYTES = 8 * 1024 * 1024;
    private const EXTENSION_BY_MIME = [
        'audio/webm' => 'webm',
        'audio/ogg' => 'ogg',
        'audio/mp4' => 'm4a',
        'audio/aac' => 'aac',
        'audio/mpeg' => 'mp3',
        'audio/wav' => 'wav',
        'audio/x-m4a' => 'm4a',
    ];

    public static function save(?array $file, string $destDir): string
    {
        if ($file === null || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            Response::error('Bitte eine Sprachnachricht aufnehmen.', 422);
        }
        if ($file['size'] > self::MAX_BYTES) {
            Response::error('Sprachnachricht ist zu groß (max. 8 MB).', 422);
        }

        $mime = strtolower(trim(explode(';', $file['type'] ?? '')[0]));
        $extension = self::EXTENSION_BY_MIME[$mime] ?? null;
        if ($extension === null) {
            Response::error('Audioformat wird nicht unterstützt.', 422);
        }

        if (!is_dir($destDir) && !mkdir($destDir, 0755, true) && !is_dir($destDir)) {
            Response::error('Speicherordner konnte nicht angelegt werden.', 500);
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        if (!move_uploaded_file($file['tmp_name'], $destDir . '/' . $filename)) {
            Response::error('Sprachnachricht konnte nicht gespeichert werden.', 500);
        }

        return $filename;
    }
}
