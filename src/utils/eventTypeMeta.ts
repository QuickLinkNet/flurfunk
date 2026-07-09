import type { EventType } from '../types/event';
import type { IconTint } from '../components/atoms/IconBadge';

interface Meta {
  emoji: string;
  label: string;
  tint: IconTint;
}

// Anzeige-Metadaten für die Event-Typen (PRD Kapitel 2/12, v1.5-Scope).
export const EVENT_TYPE_META: Record<EventType, Meta> = {
  bbq: { emoji: '🍖', label: 'Grillabend', tint: 'primary' },
  campfire: { emoji: '🔥', label: 'Lagerfeuer', tint: 'primary' },
  street_festival: { emoji: '🎪', label: 'Straßenfest', tint: 'secondary' },
  kids_play: { emoji: '🧒', label: 'Spielnachmittag', tint: 'info' },
  football: { emoji: '⚽', label: 'Fußball', tint: 'secondary' },
  pool_party: { emoji: '🏊', label: 'Poolparty', tint: 'info' },
  mulled_wine: { emoji: '🍷', label: 'Glühwein', tint: 'primary' },
  christmas_party: { emoji: '🎄', label: 'Weihnachtsfeier', tint: 'error' },
  other: { emoji: '📌', label: 'Sonstiges', tint: 'secondary' }
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_META) as [EventType, Meta][];
