export type FeedItemType =
  | 'vacation' | 'home' | 'visit_expected' | 'package_received'
  | 'tool_available' | 'help_needed' | 'street_closed' | 'babysitter_needed';

export interface FeedItem {
  id: number;
  householdName: string;
  type: FeedItemType;
  message: string | null;
  visibility: 'public' | 'neighbors' | 'private';
  createdAt: string;
}
