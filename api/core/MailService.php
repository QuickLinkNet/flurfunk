<?php

namespace App\Core;

final class MailService
{
    public static function sendInvitation(array $invite, ?array $household): bool
    {
        $email = trim((string) ($invite['email'] ?? ''));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $link = self::inviteLink((string) $invite['code']);
        $subject = 'Einladung zu Flurfunk';
        $message = self::invitationMessage($invite, $household, $link);
        return self::sendPlainText($email, $subject, $message);
    }

    public static function sendWeeklyDigest(string $email, string $displayName, array $digest): bool
    {
        $email = trim($email);
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return self::sendPlainText(
            $email,
            'Dein Flurfunk-Wochenblick',
            WeeklyDigestFormatter::toMailText($displayName, $digest)
        );
    }

    public static function sendPasswordReset(string $email, string $displayName, string $token): bool
    {
        $email = trim($email);
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $link = self::passwordResetLink($token);
        $message = implode("\n", [
            "Hallo {$displayName},",
            '',
            'für dein Flurfunk-Konto wurde ein neues Passwort angefordert.',
            'Falls du das warst, klicke innerhalb der nächsten Stunde auf diesen Link:',
            $link,
            '',
            'Falls du das nicht warst, kannst du diese E-Mail ignorieren - dein Passwort bleibt unverändert.',
        ]);
        return self::sendPlainText($email, 'Flurfunk: Passwort zurücksetzen', $message);
    }

    private static function sendPlainText(string $email, string $subject, string $message): bool
    {
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'From: Flurfunk <noreply@red-it.org>',
            'Reply-To: noreply@red-it.org',
        ];

        return @mail($email, $subject, $message, implode("\r\n", $headers));
    }

    private static function inviteLink(string $code): string
    {
        return self::linkFor('/apps/neighborhood/registrieren/' . rawurlencode($code));
    }

    private static function passwordResetLink(string $token): string
    {
        return self::linkFor('/apps/neighborhood/passwort-zuruecksetzen/' . rawurlencode($token));
    }

    private static function linkFor(string $path): string
    {
        $host = $_SERVER['HTTP_HOST'] ?? 'www.red-it.org';
        $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        $scheme = $isHttps ? 'https' : 'http';

        if (str_contains($host, 'red-it.org')) {
            $scheme = 'https';
        }

        return $scheme . '://' . $host . $path;
    }

    private static function invitationMessage(array $invite, ?array $household, string $link): string
    {
        $firstName = trim((string) ($invite['first_name'] ?? ''));
        $householdName = trim((string) ($household['name'] ?? ''));
        $householdLine = $householdName !== '' ? "Du wurdest für den Haushalt {$householdName} eingeladen." : '';

        $lines = [
            "Hallo {$firstName},",
            '',
            'du bist zu Flurfunk eingeladen, dem geschützten Nachbarschaftsbereich unserer Straße.',
        ];
        if ($householdLine !== '') {
            $lines[] = $householdLine;
        }

        return implode("\n", [
            ...$lines,
            '',
            'Direkt beitreten:',
            $link,
            '',
            'Dein Einladungscode:',
            (string) $invite['code'],
            '',
            'Nach der Registrierung kannst du euren Haushalt einrichten, Push aktivieren und wichtige Infos aus der Straße sehen.',
        ]);
    }
}
