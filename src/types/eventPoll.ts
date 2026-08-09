import type { EventType, RsvpResponse } from './event';

export interface EventPollOption {
  id: number;
  startsAt: string;
  endsAt: string | null;
  yesCount: number;
  maybeCount: number;
  noCount: number;
  myResponse: RsvpResponse | null;
}

export interface EventPoll {
  id: number;
  title: string;
  type: EventType;
  description: string | null;
  location: string | null;
  visibility: 'public' | 'neighbors';
  status: 'open' | 'closed';
  creatorHouseholdName: string;
  resultingEventId: number | null;
  createdAt: string;
  canManage: boolean;
  options: EventPollOption[];
}

export interface NewEventPollInput {
  title: string;
  type: EventType;
  description?: string;
  location?: string;
  visibility?: 'public' | 'neighbors';
  dates: string[];
}

export interface EventPollVoteInput {
  optionId: number;
  response: RsvpResponse;
}
