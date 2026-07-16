import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { CalendarBoard } from '../components/organisms/CalendarBoard';
import { fetchCalendarEntries } from '../api/calendarApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { startOfMonth, endOfMonth, addMonths, toISODate } from '../utils/date';
import type { CalendarEntry } from '../types/calendarEntry';

export function CalendarPage() {
  const [anchorDate] = useState(() => new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);

  const reload = useCallback(() => {
    const from = toISODate(startOfMonth(addMonths(anchorDate, -2)));
    const to = toISODate(endOfMonth(addMonths(anchorDate, 6)));
    fetchCalendarEntries(from, to).then(setEntries).catch(() => setEntries([]));
  }, [anchorDate]);

  useEffect(() => reload(), [reload]);

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.calendar.title} pageSubtitle={PAGE_HEADERS.calendar.subtitle}>
      <CalendarBoard entries={entries} onChanged={reload} />
    </DashboardTemplate>
  );
}
