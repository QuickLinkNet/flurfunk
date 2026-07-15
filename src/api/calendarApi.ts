import { apiRequest } from './client';
import type { CalendarEntry } from '../types/calendarEntry';

export function fetchCalendarEntries(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  return apiRequest<CalendarEntry[]>(`/calendar?${params.toString()}`);
}

export interface NewCalendarEntry {
  type: CalendarEntry['type'];
  title: string;
  startsAt: string;
  endsAt?: string | null;
  allDay: boolean;
  visibility: 'public' | 'neighbors' | 'private';
}

export function createCalendarEntry(entry: NewCalendarEntry) {
  return apiRequest<{ id: number }>('/calendar', { method: 'POST', body: JSON.stringify(entry) });
}

export function updateCalendarEntry(id: number, entry: NewCalendarEntry) {
  return apiRequest<CalendarEntry>(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(entry) });
}

export function deleteCalendarEntry(id: number) {
  return apiRequest<null>(`/calendar/${id}`, { method: 'DELETE' });
}
