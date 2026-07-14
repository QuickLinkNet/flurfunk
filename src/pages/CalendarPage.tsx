import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { CalendarBoard } from '../components/organisms/CalendarBoard';
import { Heading } from '../components/atoms/Heading';
import { fetchCalendarEntries } from '../api/calendarApi';
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
    <DashboardTemplate header={<Heading level={1}>Kalender</Heading>}>
      <CalendarBoard entries={entries} onChanged={reload} />
    </DashboardTemplate>
  );
}
