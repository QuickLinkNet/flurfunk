<?php

namespace App\Core;

use App\Models\VapidKeys;

// Minimaler Web-Push-Client ohne externe Library. Unterstuetzt echte,
// verschluesselte Payloads (RFC 8291 aes128gcm) - der Service Worker zeigt
// dann Titel/Text aus der Push-Nachricht statt eines generischen Hinweises.
// Ohne p256dh/auth (oder ohne Payload) faellt der Versand auf einen leeren,
// payload-losen Push zurueck.
final class WebPush
{
    // $subscription braucht mindestens 'endpoint', fuer verschluesselte
    // Payloads zusaetzlich 'p256dh' und 'auth' (wie vom Browser geliefert).
    // Gibt den HTTP-Statuscode des Push-Dienstes zurück.
    public static function send(array $subscription, ?array $payload = null): int
    {
        $endpoint = (string) $subscription['endpoint'];
        $vapid = VapidKeys::get();
        $audience = self::originOf($endpoint);
        $jwt = self::buildVapidJwt($audience, $vapid['privatePem']);
        $headers = ['Authorization: vapid t=' . $jwt . ', k=' . $vapid['public'], 'TTL: 60'];

        $p256dh = trim((string) ($subscription['p256dh'] ?? ''));
        $auth = trim((string) ($subscription['auth'] ?? ''));
        $body = '';
        if ($payload !== null && $p256dh !== '' && $auth !== '') {
            $body = self::encryptPayload(json_encode($payload, JSON_UNESCAPED_UNICODE), $p256dh, $auth);
            $headers[] = 'Content-Type: application/octet-stream';
            $headers[] = 'Content-Encoding: aes128gcm';
        } else {
            $headers[] = 'Content-Length: 0';
        }

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $status;
    }

    // Verschlüsselt den Payload nach RFC 8291 (Web Push Encryption) /
    // RFC 8188 (aes128gcm Content-Encoding). $p256dhB64/$authB64 sind die
    // base64url-codierten Werte aus der Browser-Subscription.
    private static function encryptPayload(string $payloadJson, string $p256dhB64, string $authB64): string
    {
        $clientPublicKeyRaw = VapidKeys::base64UrlDecode($p256dhB64);
        $authSecret = VapidKeys::base64UrlDecode($authB64);

        $clientPublicKeyResource = openssl_pkey_get_public(self::rawEcPointToPem($clientPublicKeyRaw));
        if ($clientPublicKeyResource === false) {
            throw new \RuntimeException('Ungültiger p256dh-Schlüssel: ' . openssl_error_string());
        }

        $ephemeral = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
        if ($ephemeral === false) {
            throw new \RuntimeException('Ephemeres Schlüsselpaar fehlgeschlagen: ' . openssl_error_string());
        }
        $ephemeralDetails = openssl_pkey_get_details($ephemeral);
        $ephemeralPublicKeyRaw = "\x04"
            . str_pad($ephemeralDetails['ec']['x'], 32, "\x00", STR_PAD_LEFT)
            . str_pad($ephemeralDetails['ec']['y'], 32, "\x00", STR_PAD_LEFT);

        $sharedSecret = openssl_pkey_derive($clientPublicKeyResource, $ephemeral, 32);
        if ($sharedSecret === false) {
            throw new \RuntimeException('ECDH-Ableitung fehlgeschlagen: ' . openssl_error_string());
        }

        $prkInfo = "WebPush: info\x00" . $clientPublicKeyRaw . $ephemeralPublicKeyRaw;
        $prkKey = hash_hkdf('sha256', $sharedSecret, 32, $prkInfo, $authSecret);

        $salt = random_bytes(16);
        $cek = hash_hkdf('sha256', $prkKey, 16, "Content-Encoding: aes128gcm\x00", $salt);
        $nonce = hash_hkdf('sha256', $prkKey, 12, "Content-Encoding: nonce\x00", $salt);

        // Padding-Delimiter 0x02 markiert das letzte (einzige) Record, keine
        // zusätzliche Polsterung nötig - die Nachrichten sind kurz genug.
        $ciphertext = openssl_encrypt($payloadJson . "\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
        if ($ciphertext === false) {
            throw new \RuntimeException('Push-Payload konnte nicht verschlüsselt werden: ' . openssl_error_string());
        }
        $ciphertextWithTag = $ciphertext . $tag;

        // aes128gcm-Record-Header (RFC 8188 §2.1): Salt(16) + RecordSize(4,
        // big-endian) + KeyIdLänge(1) + KeyId (= unser ephemerer Public Key).
        $header = $salt
            . pack('N', strlen($ciphertextWithTag))
            . chr(strlen($ephemeralPublicKeyRaw))
            . $ephemeralPublicKeyRaw;

        return $header . $ciphertextWithTag;
    }

    // Baut aus dem rohen 65-Byte EC-Punkt (0x04 || X || Y) ein PEM, das
    // openssl_pkey_get_public() versteht (SubjectPublicKeyInfo, P-256).
    private static function rawEcPointToPem(string $rawPoint): string
    {
        $spkiPrefix = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200');
        $der = $spkiPrefix . $rawPoint;
        $base64 = chunk_split(base64_encode($der), 64, "\n");
        return "-----BEGIN PUBLIC KEY-----\n{$base64}-----END PUBLIC KEY-----\n";
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
