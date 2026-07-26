<?php

namespace App\Core;

use App\Models\CalendarEntry;
use App\Models\Event;
use App\Models\Street;

final class WeeklyDigestService
{
    public static function build(): array
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $weekAgo = $now->sub(new \DateInterval('P7D'));
        $weekAhead = $now->add(new \DateInterval('P7D'));
        $trashAhead = $now->add(new \DateInterval('P14D'));
        $street = Street::first();

        $feedItems = self::recentFeed($weekAgo);
        $events = self::upcomingEvents($now, $weekAhead);
        $calendarItems = self::calendarItems($now, $weekAhead, false);
        $trashItems = self::calendarItems($now, $trashAhead, true);
        $recipients = self::recipientSummary();
        $sections = [
            [
                'title' => 'Neu in der Straße',
                'emptyText' => 'Keine neuen Meldungen in den letzten 7 Tagen.',
                'items' => $feedItems,
            ],
            [
                'title' => 'Treffen & Events',
                'emptyText' => 'Keine Events in den nächsten 7 Tagen.',
                'items' => $events,
            ],
            [
                'title' => 'Termine im Blick',
                'emptyText' => 'Keine Termine in den nächsten 7 Tagen.',
                'items' => $calendarItems,
            ],
            [
                'title' => 'Müll & Erinnerung',
                'emptyText' => 'Kein Mülltermin in den nächsten 14 Tagen gefunden.',
                'items' => $trashItems,
            ],
        ];
        $summary = [
            'feedCount' => count($feedItems),
            'eventCount' => count($events),
            'calendarCount' => count($calendarItems),
            'trashCount' => count($trashItems),
        ];

        return [
            'generatedAt' => $now->format(DATE_ATOM),
            'rangeLabel' => 'Letzte 7 Tage / nächste 7 Tage',
            'streetName' => $street['name'] ?? 'deiner Straße',
            'headline' => WeeklyDigestFormatter::headline($summary),
            'intro' => WeeklyDigestFormatter::intro($summary),
            'highlights' => self::highlights($sections),
            'recipients' => $recipients,
            'history' => self::recentRuns(),
            'summary' => $summary,
            'sections' => $sections,
        ];
    }

    public static function sendToAllRecipients(bool $force = false): array
    {
        $digest = self::build();
        $weekKey = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('o-\WW');
        $recipients = self::digestRecipients();
        $result = [
            'weekKey' => $weekKey,
            'sent' => 0,
            'skipped' => 0,
            'failed' => 0,
            'recipients' => count($recipients),
            'details' => [],
        ];

        foreach ($recipients as $recipient) {
            $userId = (int) $recipient['id'];
            $email = (string) $recipient['email'];
            if (!$force && self::wasSent($weekKey, $userId)) {
                $result['skipped']++;
                $result['details'][] = ['email' => $email, 'status' => 'skipped'];
                continue;
            }

            $sent = MailService::sendWeeklyDigest($email, (string) $recipient['display_name'], $digest);
            if (!$sent) {
                $result['failed']++;
                $result['details'][] = ['email' => $email, 'status' => 'failed'];
                continue;
            }

            self::markSent($weekKey, $userId, $email);
            $result['sent']++;
            $result['details'][] = ['email' => $email, 'status' => 'sent'];
        }

        return $result;
    }

    private static function recentFeed(\DateTimeImmutable $from): array
    {
        $stmt = Database::pdo()->prepare(
            "SELECT f.id, f.type, f.message, f.created_at, h.name AS household_name
             FROM feed_items f
             JOIN households h ON h.id = f.household_id
             WHERE f.visibility IN ('public', 'neighbors')
               AND f.created_at >= ?
             ORDER BY f.created_at DESC
             LIMIT 8"
        );
        $stmt->execute([$from->format('Y-m-d H:i:s')]);
        return array_map(
            fn(array $row): array => [
                'id' => 'feed-' . (int) $row['id'],
                'title' => WeeklyDigestFormatter::feedTitle((string) $row['type']),
                'meta' => self::formatDateTime((string) $row['created_at']) . ' · ' . (string) $row['household_name'],
                'detail' => trim((string) ($row['message'] ?? '')),
                'tone' => WeeklyDigestFormatter::feedTone((string) $row['type']),
            ],
            $stmt->fetchAll()
        );
    }

    private static function digestRecipients(): array
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

    private static function recipientSummary(): array
    {
        $stmt = Database::pdo()->query(
            "SELECT
                SUM(CASE WHEN email IS NOT NULL AND trim(email) != '' THEN 1 ELSE 0 END) AS with_email,
                SUM(CASE WHEN email IS NULL OR trim(email) = '' THEN 1 ELSE 0 END) AS without_email,
                SUM(CASE WHEN email IS NOT NULL AND trim(email) != '' AND COALESCE(weekly_digest_enabled, 1) = 1 THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN email IS NOT NULL AND trim(email) != '' AND COALESCE(weekly_digest_enabled, 1) = 0 THEN 1 ELSE 0 END) AS disabled
             FROM users"
        );
        $row = $stmt->fetch() ?: [];
        $active = (int) ($row['active'] ?? 0);
        $disabled = (int) ($row['disabled'] ?? 0);
        $withoutEmail = (int) ($row['without_email'] ?? 0);

        return [
            'active' => $active,
            'disabled' => $disabled,
            'withoutEmail' => $withoutEmail,
            'totalWithEmail' => (int) ($row['with_email'] ?? 0),
            'total' => $active + $disabled + $withoutEmail,
        ];
    }

    private static function recentRuns(): array
    {
        $stmt = Database::pdo()->query(
            "SELECT wdr.id, wdr.week_key, wdr.email, wdr.sent_at, u.display_name
             FROM weekly_digest_runs wdr
             LEFT JOIN users u ON u.id = wdr.user_id
             ORDER BY wdr.sent_at DESC
             LIMIT 12"
        );
        return array_map(
            fn(array $row): array => [
                'id' => (int) $row['id'],
                'weekKey' => (string) $row['week_key'],
                'email' => (string) $row['email'],
                'displayName' => $row['display_name'] ?? null,
                'sentAt' => (string) $row['sent_at'],
            ],
            $stmt->fetchAll()
        );
    }

    private static function wasSent(string $weekKey, int $userId): bool
    {
        $stmt = Database::pdo()->prepare('SELECT 1 FROM weekly_digest_runs WHERE week_key = ? AND user_id = ? LIMIT 1');
        $stmt->execute([$weekKey, $userId]);
        return (bool) $stmt->fetchColumn();
    }

    private static function markSent(string $weekKey, int $userId, string $email): void
    {
        $stmt = Database::pdo()->prepare(
            'INSERT OR IGNORE INTO weekly_digest_runs (week_key, user_id, email) VALUES (?, ?, ?)'
        );
        $stmt->execute([$weekKey, $userId, $email]);
    }

    private static function upcomingEvents(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return array_slice(array_map(
            fn(array $event): array => [
                'id' => 'event-' . (int) $event['id'],
                'title' => (string) $event['title'],
                'meta' => self::formatDateTime((string) $event['starts_at']),
                'detail' => trim(implode(' · ', array_filter([
                    (string) ($event['location'] ?? ''),
                    (string) ($event['creator_household_name'] ?? ''),
                ]))),
                'tone' => 'event',
            ],
            Event::findInRange($from->format('Y-m-d\TH:i:s\Z'), $to->format('Y-m-d\TH:i:s\Z'), 'member')
        ), 0, 6);
    }

    private static function calendarItems(\DateTimeImmutable $from, \DateTimeImmutable $to, bool $trashOnly): array
    {
        $entries = CalendarEntry::findInRange(
            $from->format('Y-m-d'),
            $to->format('Y-m-d'),
            'member',
            null
        );
        $items = [];
        foreach ($entries as $entry) {
            foreach (self::expandEntry($entry, $from, $to) as $occurrence) {
                $isTrash = ($occurrence['type'] ?? '') === 'trash';
                if ($trashOnly !== $isTrash) {
                    continue;
                }
                $items[] = [
                    'id' => ($trashOnly ? 'trash-' : 'calendar-') . (int) $occurrence['id'] . '-' . substr((string) $occurrence['starts_at'], 0, 10),
                    'title' => (string) $occurrence['title'],
                    'meta' => self::formatDateTime((string) $occurrence['starts_at']),
                    'detail' => WeeklyDigestFormatter::calendarTypeLabel((string) $occurrence['type']),
                    'tone' => $isTrash ? 'trash' : 'calendar',
                    'sortKey' => strtotime((string) $occurrence['starts_at']) ?: 0,
                ];
            }
        }
        usort($items, fn(array $a, array $b): int => ((int) $a['sortKey']) <=> ((int) $b['sortKey']));
        return array_map(
            fn(array $item): array => array_diff_key($item, ['sortKey' => true]),
            array_slice($items, 0, $trashOnly ? 3 : 6)
        );
    }

    private static function expandEntry(array $entry, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $rule = (string) ($entry['recurrence_rule'] ?? 'none');
        if ($rule === 'none') {
            return [self::normalizeOccurrence($entry)];
        }

        $start = new \DateTimeImmutable(str_replace(' ', 'T', (string) $entry['starts_at']));
        $until = $entry['recurrence_until'] !== null
            ? new \DateTimeImmutable(str_replace(' ', 'T', (string) $entry['recurrence_until']))
            : $to;
        if ($until > $to) {
            $until = $to;
        }
        $interval = match ($rule) {
            'daily' => new \DateInterval('P1D'),
            'weekly' => new \DateInterval('P1W'),
            'monthly' => new \DateInterval('P1M'),
            default => new \DateInterval('P100Y'),
        };

        $occurrences = [];
        $guard = 0;
        while ($start < $from && $guard < 500) {
            $start = $start->add($interval);
            $guard++;
        }
        while ($start <= $until && $start <= $to && $guard < 800) {
            $copy = $entry;
            $copy['starts_at'] = $start->format('Y-m-d\TH:i:s');
            $occurrences[] = self::normalizeOccurrence($copy);
            $start = $start->add($interval);
            $guard++;
        }
        return $occurrences;
    }

    private static function normalizeOccurrence(array $entry): array
    {
        return $entry;
    }

    private static function highlights(array $sections): array
    {
        $items = [];
        foreach ($sections as $section) {
            foreach ($section['items'] ?? [] as $item) {
                $items[] = $item;
                if (count($items) >= 3) {
                    return $items;
                }
            }
        }
        return $items;
    }

    private static function formatDateTime(string $value): string
    {
        $timestamp = strtotime($value);
        if ($timestamp === false) {
            return $value;
        }
        return date('d.m., H:i', $timestamp);
    }
}
