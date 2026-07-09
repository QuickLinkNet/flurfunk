export type FeatureKey = 'feed' | 'events' | 'calendar' | 'children' | 'pets';

export type FeatureFlags = Record<FeatureKey, boolean>;

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  feed: 'Straßen-Feed',
  events: 'Events & RSVP',
  calendar: 'Kalender',
  children: 'Kinderverwaltung',
  pets: 'Haustiere'
};
