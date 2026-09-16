<?php

namespace App\Core;

// Geteilte Validierung für Geburtsdatums-Felder (Erwachsene in AuthController,
// Kinder in ChildController) - volles Datum, kein Zukunftsdatum, kein
// unplausibles Jahr. Bricht den Request bei ungültigem Wert direkt über
// Response::error ab (siehe AuthController::normalizeBirthday, aus der das
// hier extrahiert wurde).
final class BirthdayValidation
{
    public static function normalize(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));
        if ($value === '') {
            return null;
        }
        $date = \DateTimeImmutable::createFromFormat('Y-m-d', $value);
        if ($date === false || $date->format('Y-m-d') !== $value) {
            Response::error('Ungültiges Geburtsdatum.', 422);
        }
        if ((int) $date->format('Y') < 1900 || $date > new \DateTimeImmutable('today')) {
            Response::error('Ungültiges Geburtsdatum.', 422);
        }
        return $value;
    }
}
