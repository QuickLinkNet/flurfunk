<?php

namespace App\Core;

use App\Models\CalendarEntry;

// Vorabend-Erinnerung fuer Mülltermine: niemand fragt danach, aber jeder
// freut sich, wenn die App am Vorabend dran erinnert statt erst hinterher.
// Bewusst getrennt vom woechentlichen Digest (der deckt die naechsten 14
// Tage ab, aber eben nur einmal pro Woche - zu selten fuer "morgen").
final class TrashReminderService
{
    public static function sendForTomorrow(): array
    {
        $tomorrow = gmdate('Y-m-d', strtotime('+1 day'));
        $entries = CalendarEntry::findPendingTrashRemindersFor($tomorrow);

        if (count($entries) === 0) {
            return ['date' => $tomorrow, 'entries' => 0, 'titles' => [], 'push' => null, 'mailSent' => 0, 'mailTotal' => 0];
        }

        $titles = array_values(array_unique(array_map(fn(array $e) => (string) $e['title'], $entries)));

        $push = PushService::sendBroadcast();

        $mailSent = 0;
        $recipients = self::mailRecipients();
        foreach ($recipients as $recipient) {
            if (MailService::sendTrashReminder((string) $recipient['email'], (string) $recipient['display_name'], $titles)) {
                $mailSent++;
            }
        }

        foreach ($entries as $entry) {
            CalendarEntry::markTrashReminderSent((int) $entry['id']);
        }

        return [
            'date' => $tomorrow,
            'entries' => count($entries),
            'titles' => $titles,
            'push' => $push,
            'mailSent' => $mailSent,
            'mailTotal' => count($recipients),
        ];
    }

    public static function previewForTomorrow(): array
    {
        $tomorrow = gmdate('Y-m-d', strtotime('+1 day'));
        $entries = CalendarEntry::findPendingTrashRemindersFor($tomorrow);
        $titles = array_values(array_unique(array_map(fn(array $e) => (string) $e['title'], $entries)));

        return [
            'date' => $tomorrow,
            'entries' => count($entries),
            'titles' => $titles,
            'mailTotal' => count(self::mailRecipients()),
        ];
    }

    private static function mailRecipients(): array
    {
        $stmt = Database::pdo()->query(
            "SELECT id, email, display_name
             FROM users
             WHERE email IS NOT NULL AND trim(email) != ''
               AND COALESCE(weekly_digest_enabled, 1) = 1
             ORDER BY display_name"
        );
        return $stmt->fetchAll();
    }
}
