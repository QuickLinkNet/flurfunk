import type { CalendarEntry } from '../types/calendarEntry';

export interface CalendarTypeMeta {
  label: string;
  color: string;
}

export const CALENDAR_TYPE_META: Record<CalendarEntry['type'], CalendarTypeMeta> = {
  vacation: { label: 'Urlaub', color: '#7A9E7E' },
  birthday: { label: 'Geburtstag', color: '#C989B8' },
  event: { label: 'Event', color: '#C8643F' },
  visit: { label: 'Besuch', color: '#5D8AA8' },
  street_action: { label: 'Straßenaktion', color: '#D39A2D' },
  holiday: { label: 'Ferien', color: '#8E7CC3' },
  trash: { label: 'Müll', color: '#6B7280' },
  appointment: { label: 'Termin', color: '#2F5D46' },
  childcare: { label: 'Kinderbetreuung', color: '#3E9C8F' }
};

export const CALENDAR_TYPE_OPTIONS = Object.entries(CALENDAR_TYPE_META) as [CalendarEntry['type'], CalendarTypeMeta][];
