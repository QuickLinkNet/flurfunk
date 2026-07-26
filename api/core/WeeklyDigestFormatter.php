<?php

namespace App\Core;

final class WeeklyDigestFormatter
{
    public static function toMailText(string $displayName, array $digest): string
    {
        $name = trim($displayName) !== '' ? trim($displayName) : 'Nachbar:in';
        $lines = [
            "Hallo {$name},",
            '',
            (string) ($digest['headline'] ?? 'Dein Flurfunk-Wochenblick'),
            (string) ($digest['intro'] ?? ('für ' . ($digest['streetName'] ?? 'deine Straße'))),
            '',
            self::summaryLine($digest['summary'] ?? []),
        ];

        $highlights = $digest['highlights'] ?? [];
        if (count($highlights) > 0) {
            $lines[] = '';
            $lines[] = 'Diese Woche wichtig';
            foreach ($highlights as $item) {
                $lines[] = self::mailItemLine($item);
            }
        }

        foreach ($digest['sections'] ?? [] as $section) {
            $lines[] = '';
            $lines[] = (string) ($section['title'] ?? 'Abschnitt');
            $items = $section['items'] ?? [];
            if (count($items) === 0) {
                $lines[] = 'Keine Einträge.';
                continue;
            }
            foreach ($items as $item) {
                $lines[] = self::mailItemLine($item);
            }
        }

        $lines[] = '';
        $lines[] = 'Direkt öffnen: ' . self::appLink();
        return implode("\n", $lines);
    }

    public static function headline(array $summary): string
    {
        $total = (int) ($summary['feedCount'] ?? 0)
            + (int) ($summary['eventCount'] ?? 0)
            + (int) ($summary['calendarCount'] ?? 0)
            + (int) ($summary['trashCount'] ?? 0);
        return $total > 0 ? 'Diese Woche in deiner Straße' : 'Ruhige Woche in deiner Straße';
    }

    public static function intro(array $summary): string
    {
        $parts = [];
        if (($summary['feedCount'] ?? 0) > 0) {
            $parts[] = $summary['feedCount'] . ' neue Meldungen';
        }
        if (($summary['eventCount'] ?? 0) > 0) {
            $parts[] = $summary['eventCount'] . ' anstehende Events';
        }
        if (($summary['calendarCount'] ?? 0) > 0) {
            $parts[] = $summary['calendarCount'] . ' Termine';
        }
        if (($summary['trashCount'] ?? 0) > 0) {
            $parts[] = $summary['trashCount'] . ' Müllhinweise';
        }
        if ($parts === []) {
            return 'Es gibt gerade nichts Dringendes. Schau trotzdem gern vorbei, wenn du etwas teilen möchtest.';
        }
        return implode(', ', $parts) . ' warten auf dich.';
    }

    public static function feedTitle(string $type): string
    {
        return match ($type) {
            'help_needed' => 'Hilfe gesucht',
            'tool_available' => 'Etwas zum Ausleihen',
            'package_received' => 'Paket angenommen',
            'trash_reminder' => 'Müllhinweis',
            'street_event' => 'Straßen-Event',
            default => 'Neue Meldung',
        };
    }

    public static function feedTone(string $type): string
    {
        return match ($type) {
            'help_needed', 'babysitter_needed', 'dog_lost', 'cat_found' => 'important',
            'tool_available', 'package_received' => 'helpful',
            'bbq', 'garden_party', 'spontaneous_meetup', 'street_event' => 'event',
            default => 'feed',
        };
    }

    public static function calendarTypeLabel(string $type): string
    {
        return match ($type) {
            'vacation' => 'Urlaub',
            'birthday' => 'Geburtstag',
            'street_action' => 'Straßenaktion',
            'holiday' => 'Ferien',
            'trash' => 'Müll',
            'visit' => 'Besuch',
            default => 'Termin',
        };
    }

    private static function summaryLine(array $summary): string
    {
        return sprintf(
            '%d Meldungen, %d Events, %d Termine, %d Müllhinweise.',
            (int) ($summary['feedCount'] ?? 0),
            (int) ($summary['eventCount'] ?? 0),
            (int) ($summary['calendarCount'] ?? 0),
            (int) ($summary['trashCount'] ?? 0)
        );
    }

    private static function mailItemLine(array $item): string
    {
        $meta = trim((string) ($item['meta'] ?? ''));
        $detail = trim((string) ($item['detail'] ?? ''));
        $line = '- ' . (string) ($item['title'] ?? 'Eintrag');
        if ($meta !== '') {
            $line .= ' (' . $meta . ')';
        }
        if ($detail !== '') {
            $line .= ': ' . $detail;
        }
        return $line;
    }

    private static function appLink(): string
    {
        $host = $_SERVER['HTTP_HOST'] ?? 'www.red-it.org';
        $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        $scheme = $isHttps || str_contains($host, 'red-it.org') ? 'https' : 'http';
        return $scheme . '://' . $host . '/apps/neighborhood/dashboard';
    }
}
