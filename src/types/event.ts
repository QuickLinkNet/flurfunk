import type { PushSendResult } from './push';

export type EventType =
  | 'bbq' | 'campfire' | 'street_festival' | 'kids_play' | 'football'
  | 'pool_party' | 'mulled_wine' | 'christmas_party' | 'other';

export type RsvpResponse = 'yes' | 'maybe' | 'no';

export interface StreetEvent {
  id: number;
  title: string;
  type: EventType;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  visibility: 'public' | 'neighbors';
  creatorHouseholdName: string;
  createdAt: string;
  canManage: boolean;
  rsvpCounts: { yes: number; maybe: number; no: number };
}

export interface EventResponseEntry {
  id: number;
  householdId: number;
  householdName: string;
  response: RsvpResponse;
  adultsCount: number | null;
  childrenCount: number | null;
  note: string | null;
  updatedAt: string;
}

export interface EventDetail {
  event: StreetEvent;
  responses: EventResponseEntry[];
}

export interface EventReminderResult {
  push: PushSendResult;
  remindedHouseholds: number;
}
