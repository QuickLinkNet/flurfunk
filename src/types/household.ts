export interface Household {
  id: number;
  name: string;
  addressLine: string;
  avatarKey: string;
  statusEmoji: string;
  statusLabel: string;
  statusNote: string | null;
  statusUpdatedAt: string | null;
}

export const DEFAULT_STATUSES: Array<{ emoji: string; label: string }> = [
  { emoji: '🏠', label: 'Zuhause' },
  { emoji: '🏖️', label: 'Urlaub' },
  { emoji: '🚗', label: 'Unterwegs' },
  { emoji: '👶', label: 'Kinder bei Mama' },
  { emoji: '👨', label: 'Kinder bei Papa' },
  { emoji: '🎉', label: 'Gäste da' },
  { emoji: '🔥', label: 'Grillabend' },
  { emoji: '🌙', label: 'Nicht stören' }
];
