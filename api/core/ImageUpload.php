<?php

namespace App\Core;

// Geteilte Bild-Upload-Logik fuer Feed-/Event-Fotos. Im Unterschied zum
// Profilbild (User::uploadAvatarPhoto, quadratischer Zuschnitt) bleibt hier
// das Seitenverhaeltnis erhalten - es wird nur auf eine Maximalgroesse
// verkleinert, kein Crop.
final class ImageUpload
{
    private const MAX_BYTES = 6 * 1024 * 1024;
    private const CREATORS = [
        'image/jpeg' => 'imagecreatefromjpeg',
        'image/png' => 'imagecreatefrompng',
        'image/webp' => 'imagecreatefromwebp',
    ];

    public static function readUploadedImage(?array $file): \GdImage
    {
        if ($file === null || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            Response::error('Bitte ein Bild auswählen.', 422);
        }
        if ($file['size'] > self::MAX_BYTES) {
            Response::error('Bild ist zu groß (max. 6 MB).', 422);
        }

        $info = @getimagesize($file['tmp_name']);
        if ($info === false || !isset(self::CREATORS[$info['mime']])) {
            Response::error('Bitte ein JPG-, PNG- oder WebP-Bild hochladen.', 422);
        }

        $creator = self::CREATORS[$info['mime']];
        $source = @$creator($file['tmp_name']);
        if ($source === false) {
            Response::error('Bild konnte nicht gelesen werden.', 422);
        }
        return $source;
    }

    public static function saveResizedToFit(\GdImage $source, string $destPath, int $maxDimension = 1400, int $quality = 82): void
    {
        $srcWidth = imagesx($source);
        $srcHeight = imagesy($source);
        $scale = min(1.0, $maxDimension / max($srcWidth, $srcHeight));
        $destWidth = max(1, (int) round($srcWidth * $scale));
        $destHeight = max(1, (int) round($srcHeight * $scale));

        $dest = imagecreatetruecolor($destWidth, $destHeight);
        imagecopyresampled($dest, $source, 0, 0, 0, 0, $destWidth, $destHeight, $srcWidth, $srcHeight);
        imagedestroy($source);

        $dir = dirname($destPath);
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            imagedestroy($dest);
            Response::error('Speicherordner konnte nicht angelegt werden.', 500);
        }

        $saved = imagejpeg($dest, $destPath, $quality);
        imagedestroy($dest);
        if (!$saved) {
            Response::error('Bild konnte nicht gespeichert werden.', 500);
        }
    }
}
