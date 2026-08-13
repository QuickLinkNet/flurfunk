export type FeedItemType =
  | 'vacation' | 'home' | 'visit_expected' | 'package_received'
  | 'tool_available' | 'help_needed' | 'street_closed' | 'babysitter_needed'
  | 'poll' | 'marketplace_sell' | 'marketplace_give';

export interface FeedPollOption {
  id: number;
  label: string;
  voteCount: number;
}

export interface FeedPoll {
  options: FeedPollOption[];
  totalVotes: number;
  myOptionId: number | null;
}

export interface FeedItem {
  id: number;
  householdName: string;
  type: FeedItemType;
  message: string | null;
  photoUrl: string | null;
  visibility: 'public' | 'neighbors' | 'private';
  status: 'open' | 'done';
  canManage: boolean;
  createdAt: string;
  expiresAt: string | null;
  reactionCount: number;
  reactedByMe: boolean;
  comments: FeedComment[];
  helpers: FeedHelper[];
  helpingByMe: boolean;
  loan: FeedLoan | null;
  loanedByMe: boolean;
  poll: FeedPoll | null;
}

export interface FeedComment {
  id: number;
  householdName: string | null;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface FeedHelper {
  id: number;
  householdName: string | null;
  createdAt: string;
}

export interface FeedLoan {
  householdName: string | null;
  borrowedAt: string;
}
