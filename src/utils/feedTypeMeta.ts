import type { FeedItemType } from '../types/feedItem';

interface Meta {
  emoji: string;
  label: string;
}

// Anzeige-Metadaten für die 8 MVP-Post-Typen (PRD Kapitel 3).
export const FEED_TYPE_META: Record<FeedItemType, Meta> = {
  vacation: { emoji: '🏖', label: 'Urlaub' },
  home: { emoji: '🏠', label: 'Zuhause' },
  visit_expected: { emoji: '🎉', label: 'Besuch erwartet' },
  package_received: { emoji: '📦', label: 'Paket angenommen' },
  tool_available: { emoji: '🛠', label: 'Werkzeug verleihbar' },
  help_needed: { emoji: '🙏', label: 'Hilfe benötigt' },
  street_closed: { emoji: '🚧', label: 'Straße gesperrt' },
  babysitter_needed: { emoji: '👶', label: 'Babysitter gesucht' }
};

export const FEED_TYPE_OPTIONS = Object.entries(FEED_TYPE_META) as [FeedItemType, Meta][];
