import { StatusPill } from '../atoms/StatusPill';
import { AdminContentCard } from '../molecules/AdminContentCard';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { CALENDAR_TYPE_META } from '../../utils/calendarTypeMeta';
import { formatDateRangeLabel } from '../../utils/date';
import { recurrenceSummary } from '../../utils/recurrenceLabels';
import type { AdminCalendarEntry } from '../../types/admin';
import type { CalendarEntry } from '../../types/calendarEntry';

interface Props {
  entries: AdminCalendarEntry[];
  onDelete: (entry: AdminCalendarEntry) => void;
}

function normalizeDate(value: string): string {
  return value.replace(' ', 'T');
}

function calendarTypeLabel(type: string): string {
  if (type in CALENDAR_TYPE_META) {
    return CALENDAR_TYPE_META[type as CalendarEntry['type']].label;
  }

  return type;
}

export function AdminCalendarList({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return <AdminEmptyState>Keine Kalendereinträge vorhanden.</AdminEmptyState>;
  }

  return (
    <div className="admin-content-list">
      {entries.map((entry) => (
        <AdminContentCard
          key={entry.id}
          title={entry.title}
          onDelete={() => onDelete(entry)}
          meta={
            <>
              <StatusPill label={calendarTypeLabel(entry.type)} />
              {entry.recurrenceRule !== 'none' && <StatusPill label="Serie" tone="success" />}
            </>
          }
        >
          <p>{formatDateRangeLabel(normalizeDate(entry.startsAt), entry.endsAt ? normalizeDate(entry.endsAt) : null)}</p>
          {entry.recurrenceRule !== 'none' && (
            <p>{recurrenceSummary(entry.recurrenceRule, entry.recurrenceUntil)}</p>
          )}
        </AdminContentCard>
      ))}
    </div>
  );
}
