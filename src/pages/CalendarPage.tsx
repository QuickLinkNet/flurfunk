import { useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { CalendarEntryList } from '../components/organisms/CalendarEntryList';
import { Button } from '../components/atoms/Button';
import { fetchCalendarEntries } from '../api/calendarApi';
import { startOfMonth, endOfMonth, addMonths, toISODate, formatMonthLabel } from '../utils/date';
import type { CalendarEntry } from '../types/calendarEntry';

export function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<CalendarEntry[]>([]);

  useEffect(() => {
    const from = toISODate(startOfMonth(month));
    const to = toISODate(endOfMonth(month));
    fetchCalendarEntries(from, to).then(setEntries).catch(() => setEntries([]));
  }, [month]);

  return (
    <DashboardTemplate
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="ghost" onClick={() => setMonth((m) => addMonths(m, -1))}>
            ‹
          </Button>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{formatMonthLabel(month)}</h1>
          <Button variant="ghost" onClick={() => setMonth((m) => addMonths(m, 1))}>
            ›
          </Button>
        </div>
      }
    >
      <CalendarEntryList entries={entries} />
    </DashboardTemplate>
  );
}
