export interface Household {
  id: number;
  name: string;
  addressLine: string;
  avatarKey: string;
  statusEmoji: string;
  statusLabel: string;
  statusNote: string | null;
  statusUpdatedAt: string | null;
  contactNote: string | null;
}

// "Kinder bei Mama/Papa" bewusst nicht hier: Status ist ein einzelner
// Jetzt-Wert ohne Datum, sowas gehört als Kalendereintrag (Kategorie
// "Kinderbetreuung") mit Zeitraum und eigener Sichtbarkeit hin - siehe
// CALENDAR_TYPE_META in utils/calendarTypeMeta.ts.
export const DEFAULT_STATUSES: Array<{ emoji: string; label: string }> = [
  { emoji: '🏠', label: 'Zuhause' },
  { emoji: '🏖️', label: 'Urlaub' },
  { emoji: '🚗', label: 'Unterwegs' },
  { emoji: '🎉', label: 'Gäste da' },
  { emoji: '🔥', label: 'Grillabend' },
  { emoji: '🌙', label: 'Nicht stören' }
];
