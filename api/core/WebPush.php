<?php

namespace App\Core;

use App\Models\VapidKeys;

// Minimaler Web-Push-Client ohne externe Library. Sendet bewusst nur
// payload-lose Pushes: Der Service Worker zeigt bei jedem Push einen
// generischen Hinweistext.
final class WebPush
{
    // Gibt den HTTP-Statuscode des Push-Dienstes zurück.
    public static function send(string $endpoint): int
    {
        $vapid = VapidKeys::get();
        $audience = self::originOf($endpoint);
        $jwt = self::buildVapidJwt($audience, $vapid['privatePem']);

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => '',
            CURLOPT_HTTPHEADER => [
                'TTL: 60',
                'Content-Length: 0',
                'Authorization: vapid t=' . $jwt . ', k=' . $vapid['public'],
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $status;
    }

    private static function originOf(string $endpoint): string
    {
        $parts = parse_url($endpoint);
        $origin = ($parts['scheme'] ?? 'https') . '://' . ($parts['host'] ?? '');
        if (isset($parts['port'])) {
            $origin .= ':' . $parts['port'];
        }
        return $origin;
    }

    private static function buildVapidJwt(string $audience, string $privatePem): string
    {
        $header = ['typ' => 'JWT', 'alg' => 'ES256'];
        $payload = [
            'aud' => $audience,
            'exp' => time() + 12 * 3600,
            'sub' => 'mailto:admin@red-it.org',
        ];
        $unsigned = VapidKeys::base64UrlEncode(json_encode($header))
            . '.' . VapidKeys::base64UrlEncode(json_encode($payload));

        $privateKey = openssl_pkey_get_private($privatePem);
        if ($privateKey === false) {
            throw new \RuntimeException('VAPID-Private-Key konnte nicht geladen werden: ' . openssl_error_string());
        }
        openssl_sign($unsigned, $derSignature, $privateKey, OPENSSL_ALGO_SHA256);

        return $unsigned . '.' . VapidKeys::base64UrlEncode(self::derToRawSignature($derSignature));
    }

    // openssl_sign liefert DER, JWS ES256 verlangt aber r||s mit 64 Byte.
    private static function derToRawSignature(string $der): string
    {
        $offset = 2; // 0x30 <Gesamtlänge>
        $offset++; // 0x02 (INTEGER-Tag für r)
        $rLen = ord($der[$offset]);
        $offset++;
        $r = substr($der, $offset, $rLen);
        $offset += $rLen;

        $offset++; // 0x02 (INTEGER-Tag für s)
        $sLen = ord($der[$offset]);
        $offset++;
        $s = substr($der, $offset, $sLen);

        $r = str_pad(ltrim($r, "\x00"), 32, "\x00", STR_PAD_LEFT);
        $s = str_pad(ltrim($s, "\x00"), 32, "\x00", STR_PAD_LEFT);

        return $r . $s;
    }
}
