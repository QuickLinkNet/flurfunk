import { CardRow } from './CardRow';
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
  appointment: '📌 Termin',
  childcare: '🧒 Kinderbetreuung'
};

interface Props {
  entry: CalendarEntry;
}

export function CalendarEntryRow({ entry }: Props) {
  return (
    <CardRow
      action={
        <span style={{ fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
          {TYPE_LABELS[entry.type]} · {formatDayLabel(entry.startsAt)}
        </span>
      }
    >
      <span style={{ fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>{entry.title}</span>
    </CardRow>
  );
}
