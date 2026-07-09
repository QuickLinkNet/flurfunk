<?php

namespace App\Models;

use App\Core\Database;

// VAPID-Schlüsselpaar (RFC 8292) authentifiziert unseren Server gegenüber
// den Push-Diensten (FCM, Mozilla Autopush etc.). Wird beim ersten Zugriff
// automatisch generiert und in der DB abgelegt - kein manueller Server-Schritt.
final class VapidKeys
{
    public static function get(): array
    {
        $row = Database::pdo()->query('SELECT public_key, private_key_pem FROM vapid_keys ORDER BY id LIMIT 1')->fetch();
        if ($row !== false) {
            return ['public' => $row['public_key'], 'privatePem' => $row['private_key_pem']];
        }
        return self::generate();
    }

    private static function generate(): array
    {
        $keyPair = openssl_pkey_new([
            'curve_name' => 'prime256v1',
            'private_key_type' => OPENSSL_KEYTYPE_EC,
        ]);
        if ($keyPair === false) {
            throw new \RuntimeException('VAPID-Schlüsselerzeugung fehlgeschlagen: ' . openssl_error_string());
        }
        openssl_pkey_export($keyPair, $privatePem);
        $details = openssl_pkey_get_details($keyPair);

        // x/y können kürzer als 32 Byte sein, wenn der Wert führende
        // Null-Bytes hat - für den unkomprimierten EC-Punkt (0x04 || x || y)
        // müssen es aber immer genau 32 Byte pro Koordinate sein.
        $x = str_pad($details['ec']['x'], 32, "\x00", STR_PAD_LEFT);
        $y = str_pad($details['ec']['y'], 32, "\x00", STR_PAD_LEFT);
        $publicKey = self::base64UrlEncode("\x04" . $x . $y);

        $stmt = Database::pdo()->prepare('INSERT INTO vapid_keys (public_key, private_key_pem) VALUES (?, ?)');
        $stmt->execute([$publicKey, $privatePem]);

        return ['public' => $publicKey, 'privatePem' => $privatePem];
    }

    public static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder !== 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
