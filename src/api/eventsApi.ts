import { apiRequest } from './client';
import type { EventDetail, EventType, RsvpResponse, StreetEvent } from '../types/event';

export function fetchEvents() {
  return apiRequest<StreetEvent[]>('/events');
}

export function fetchEvent(id: number) {
  return apiRequest<EventDetail>(`/events/${id}`);
}

interface NewEvent {
  title: string;
  type: EventType;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  visibility?: 'public' | 'neighbors';
}

export function createEvent(event: NewEvent) {
  return apiRequest<{ id: number }>('/events', { method: 'POST', body: JSON.stringify(event) });
}

interface RsvpInput {
  response: RsvpResponse;
  adultsCount?: number;
  childrenCount?: number;
  note?: string;
}

export function submitRsvp(eventId: number, input: RsvpInput) {
  return apiRequest<{ success: boolean }>(`/events/${eventId}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
