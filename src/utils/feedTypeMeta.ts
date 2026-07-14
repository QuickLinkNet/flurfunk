import type { FeedItemType } from '../types/feedItem';
import type { IconTint } from '../components/atoms/IconBadge';

interface Meta {
  emoji: string;
  label: string;
  tint: IconTint;
  template: string;
}

export const FEED_TYPE_META: Record<FeedItemType, Meta> = {
  vacation: { emoji: '🏖️', label: 'Urlaub', tint: 'secondary', template: 'Wir sind bis ... im Urlaub.' },
  home: { emoji: '🏠', label: 'Zuhause', tint: 'secondary', template: 'Heute ist jemand zuhause.' },
  visit_expected: { emoji: '🎉', label: 'Besuch erwartet', tint: 'info', template: 'Heute kommt Besuch, es kann kurz voller werden.' },
  package_received: { emoji: '📦', label: 'Paket angenommen', tint: 'primary', template: 'Ich habe ein Paket angenommen für ...' },
  tool_available: { emoji: '🛠️', label: 'Werkzeug verleihbar', tint: 'secondary', template: 'Ich kann heute ... verleihen.' },
  help_needed: { emoji: '🙏', label: 'Hilfe benötigt', tint: 'error', template: 'Kann jemand kurz helfen bei ...?' },
  street_closed: { emoji: '🚧', label: 'Straße gesperrt', tint: 'error', template: 'Die Straße ist am ... zwischen ... gesperrt.' },
  babysitter_needed: { emoji: '👶', label: 'Babysitter gesucht', tint: 'error', template: 'Wir suchen Babysitting für ...' }
};

export const FEED_TYPE_OPTIONS = Object.entries(FEED_TYPE_META) as [FeedItemType, Meta][];
