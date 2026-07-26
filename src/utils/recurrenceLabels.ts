import type { CalendarEntry } from '../types/calendarEntry';

type RecurrenceRule = CalendarEntry['recurrenceRule'];

export const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  none: 'Keine Wiederholung',
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  monthly: 'Monatlich'
};

export function recurrenceSummary(rule: RecurrenceRule, until?: string | null): string {
  if (rule === 'none') return RECURRENCE_LABELS.none;
  return `${RECURRENCE_LABELS[rule]}${until ? ` bis ${until.slice(0, 10)}` : ''}`;
}
