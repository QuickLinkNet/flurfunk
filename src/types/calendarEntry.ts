export interface CalendarEntry {
  id: number;
  type: 'vacation' | 'birthday' | 'event' | 'visit' | 'street_action' | 'holiday' | 'trash' | 'appointment';
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  visibility: 'public' | 'neighbors' | 'private';
  canManage: boolean;
}
