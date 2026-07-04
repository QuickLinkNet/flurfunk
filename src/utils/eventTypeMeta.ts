import type { EventType } from '../types/event';

interface Meta {
  emoji: string;
  label: string;
}

// Anzeige-Metadaten für die Event-Typen (PRD Kapitel 2/12, v1.5-Scope).
export const EVENT_TYPE_META: Record<EventType, Meta> = {
  bbq: { emoji: '🍖', label: 'Grillabend' },
  campfire: { emoji: '🔥', label: 'Lagerfeuer' },
  street_festival: { emoji: '🎪', label: 'Straßenfest' },
  kids_play: { emoji: '🧒', label: 'Spielnachmittag' },
  football: { emoji: '⚽', label: 'Fußball' },
  pool_party: { emoji: '🏊', label: 'Poolparty' },
  mulled_wine: { emoji: '🍷', label: 'Glühwein' },
  christmas_party: { emoji: '🎄', label: 'Weihnachtsfeier' },
  other: { emoji: '📌', label: 'Sonstiges' }
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_META) as [EventType, Meta][];
