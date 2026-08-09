export interface CalendarEntry {
  id: number | string;
  type: 'vacation' | 'birthday' | 'event' | 'visit' | 'street_action' | 'holiday' | 'trash' | 'appointment' | 'childcare';
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  visibility: 'public' | 'neighbors' | 'private';
  recurrenceRule: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceUntil: string | null;
  canManage: boolean;
  source?: 'calendar' | 'event';
  eventId?: number | null;
}
