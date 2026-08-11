<?php

namespace App\Core;

// Geteilte Wiederholungs-Logik fuer alles mit starts_at/ends_at/
// recurrence_rule/recurrence_until (calendar_entries UND events - beide
// nutzen exakt dieselben Spaltennamen). Urspruenglich nur in
// CalendarController fuer Kalender-Eintraege gebaut, jetzt auch fuer
// wiederkehrende Events wiederverwendet statt dupliziert.
final class RecurrenceExpander
{
    // Liefert alle Vorkommen eines (ggf. wiederkehrenden) Eintrags, die in
    // [$from, $to) liegen. Bei recurrence_rule 'none' ist das immer genau
    // der Eintrag selbst.
    public static function occurrencesInRange(array $entry, string $from, string $to): array
    {
        $rule = $entry['recurrence_rule'] ?? 'none';
        if ($rule === 'none') {
            return [$entry];
        }

        $startsAt = new \DateTimeImmutable(str_replace(' ', 'T', $entry['starts_at']));
        $endsAt = $entry['ends_at'] !== null ? new \DateTimeImmutable(str_replace(' ', 'T', $entry['ends_at'])) : null;
        $fromDate = new \DateTimeImmutable($from);
        $toDate = new \DateTimeImmutable($to);
        $until = $entry['recurrence_until'] !== null ? new \DateTimeImmutable(str_replace(' ', 'T', $entry['recurrence_until'])) : $toDate;
        if ($until > $toDate) {
            $until = $toDate;
        }

        $interval = self::interval($rule);
        $duration = $endsAt !== null ? $startsAt->diff($endsAt) : null;
        $occurrenceStart = $startsAt;
        $guard = 0;
        while ($occurrenceStart < $fromDate && $guard < 500) {
            $occurrenceStart = $occurrenceStart->add($interval);
            $guard++;
        }

        $items = [];
        while ($occurrenceStart <= $until && $guard < 800) {
            $occurrenceEnd = $duration !== null ? $occurrenceStart->add($duration) : null;
            if ($occurrenceStart < $toDate && ($occurrenceEnd === null || $occurrenceEnd >= $fromDate)) {
                $copy = $entry;
                $copy['starts_at'] = $occurrenceStart->format('Y-m-d\TH:i:s');
                $copy['ends_at'] = $occurrenceEnd?->format('Y-m-d\TH:i:s');
                $items[] = $copy;
            }
            $occurrenceStart = $occurrenceStart->add($interval);
            $guard++;
        }
        return $items;
    }

    // Naechstes Vorkommen ab (einschließlich) $from, oder null wenn die
    // Serie vorher endet (recurrence_until) bzw. bei 'none' der Termin
    // schon vorbei ist.
    public static function nextOccurrenceAt(array $entry, \DateTimeImmutable $from): ?string
    {
        $rule = $entry['recurrence_rule'] ?? 'none';
        $startsAt = new \DateTimeImmutable(str_replace(' ', 'T', $entry['starts_at']));

        if ($rule === 'none') {
            return $startsAt >= $from ? $entry['starts_at'] : null;
        }

        $until = $entry['recurrence_until'] !== null ? new \DateTimeImmutable(str_replace(' ', 'T', $entry['recurrence_until'])) : null;
        $interval = self::interval($rule);
        $occurrence = $startsAt;
        $guard = 0;
        while ($occurrence < $from && $guard < 1000) {
            $occurrence = $occurrence->add($interval);
            $guard++;
        }
        if ($until !== null && $occurrence > $until) {
            return null;
        }
        return $occurrence->format('Y-m-d H:i:s');
    }

    private static function interval(string $rule): \DateInterval
    {
        return match ($rule) {
            'daily' => new \DateInterval('P1D'),
            'weekly' => new \DateInterval('P1W'),
            'monthly' => new \DateInterval('P1M'),
            default => new \DateInterval('P100Y'),
        };
    }
}
