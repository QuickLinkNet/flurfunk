import { CalendarEntryRow } from '../molecules/CalendarEntryRow';
import type { CalendarEntry } from '../../types/calendarEntry';

interface Props {
  entries: CalendarEntry[];
}

// Bewusst eine einfache Listenansicht statt Monatsgrid (siehe PRD Kapitel 4:
// "Monats- und Listenansicht" – die Grid-Variante folgt später bei Bedarf).
export function CalendarEntryList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Keine Termine in diesem Monat.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {entries.map((entry) => (
        <CalendarEntryRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
