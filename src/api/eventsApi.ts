import { apiRequest, apiUpload } from './client';
import type { EventDetail, EventReminderResult, EventType, RecurrenceRule, RsvpResponse, StreetEvent } from '../types/event';

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
  recurrenceRule?: RecurrenceRule;
  recurrenceUntil?: string | null;
}

export function createEvent(event: NewEvent) {
  return apiRequest<{ id: number }>('/events', { method: 'POST', body: JSON.stringify(event) });
}

export function updateEvent(id: number, event: NewEvent) {
  return apiRequest<StreetEvent>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(event) });
}

export function deleteEvent(id: number) {
  return apiRequest<null>(`/events/${id}`, { method: 'DELETE' });
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

export function sendEventReminder(eventId: number) {
  return apiRequest<EventReminderResult>(`/events/${eventId}/remind`, { method: 'POST' });
}

export function uploadEventPhoto(eventId: number, file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  return apiUpload<{ photoUrl: string }>(`/events/${eventId}/photo`, formData);
}

export function deleteEventPhoto(eventId: number) {
  return apiRequest<null>(`/events/${eventId}/photo`, { method: 'DELETE' });
}
