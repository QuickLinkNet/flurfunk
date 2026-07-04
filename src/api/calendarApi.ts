import { apiRequest } from './client';
import type { CalendarEntry } from '../types/calendarEntry';

export function fetchCalendarEntries(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  return apiRequest<CalendarEntry[]>(`/calendar?${params.toString()}`);
}
