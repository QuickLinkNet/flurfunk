import type { FeedItemType } from '../types/feedItem';
import type { IconTint } from '../components/atoms/IconBadge';

interface Meta {
  emoji: string;
  label: string;
  tint: IconTint;
}

// Anzeige-Metadaten für die 8 MVP-Post-Typen (PRD Kapitel 3).
export const FEED_TYPE_META: Record<FeedItemType, Meta> = {
  vacation: { emoji: '🏖', label: 'Urlaub', tint: 'secondary' },
  home: { emoji: '🏠', label: 'Zuhause', tint: 'secondary' },
  visit_expected: { emoji: '🎉', label: 'Besuch erwartet', tint: 'info' },
  package_received: { emoji: '📦', label: 'Paket angenommen', tint: 'primary' },
  tool_available: { emoji: '🛠', label: 'Werkzeug verleihbar', tint: 'secondary' },
  help_needed: { emoji: '🙏', label: 'Hilfe benötigt', tint: 'error' },
  street_closed: { emoji: '🚧', label: 'Straße gesperrt', tint: 'error' },
  babysitter_needed: { emoji: '👶', label: 'Babysitter gesucht', tint: 'error' }
};

export const FEED_TYPE_OPTIONS = Object.entries(FEED_TYPE_META) as [FeedItemType, Meta][];
