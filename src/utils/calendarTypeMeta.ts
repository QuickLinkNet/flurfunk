import type { CalendarEntry } from '../types/calendarEntry';

export interface CalendarTypeMeta {
  label: string;
  color: string;
  emoji: string;
}

export const CALENDAR_TYPE_META: Record<CalendarEntry['type'], CalendarTypeMeta> = {
  vacation: { label: 'Urlaub', color: '#7A9E7E', emoji: '🏖️' },
  birthday: { label: 'Geburtstag', color: '#C989B8', emoji: '🎂' },
  event: { label: 'Event', color: '#C8643F', emoji: '🎉' },
  visit: { label: 'Besuch', color: '#5D8AA8', emoji: '🚗' },
  street_action: { label: 'Straßenaktion', color: '#D39A2D', emoji: '🚧' },
  holiday: { label: 'Ferien', color: '#8E7CC3', emoji: '🏫' },
  trash: { label: 'Müll', color: '#6B7280', emoji: '🗑️' },
  appointment: { label: 'Termin', color: '#2F5D46', emoji: '📌' },
  childcare: { label: 'Kinderbetreuung', color: '#3E9C8F', emoji: '👶' }
};

export const CALENDAR_TYPE_OPTIONS = Object.entries(CALENDAR_TYPE_META) as [CalendarEntry['type'], CalendarTypeMeta][];
