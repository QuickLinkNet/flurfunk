import { formatDayLabel } from '../../utils/date';
import type { CalendarEntry } from '../../types/calendarEntry';

const TYPE_LABELS: Record<CalendarEntry['type'], string> = {
  vacation: '🏖 Urlaub',
  birthday: '🎂 Geburtstag',
  event: '🎉 Event',
  visit: '👋 Besuch',
  street_action: '📢 Straßenaktion',
  holiday: '🏫 Ferien',
  trash: '🗑 Mülltermin',
  appointment: '📌 Termin'
};

interface Props {
  entry: CalendarEntry;
}

export function CalendarEntryRow({ entry }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: 'var(--md-radius-control)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)'
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{entry.title}</span>
      <span style={{ fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
        {TYPE_LABELS[entry.type]} · {formatDayLabel(entry.startsAt)}
      </span>
    </div>
  );
}
