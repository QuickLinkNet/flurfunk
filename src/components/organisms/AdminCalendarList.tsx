import { Button } from '../atoms/Button';
import { CardRow } from '../molecules/CardRow';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminCalendarEntry } from '../../types/admin';

interface Props {
  entries: AdminCalendarEntry[];
  onDelete: (id: number) => void;
}

export function AdminCalendarList({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Keine Kalendereinträge vorhanden.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {entries.map((entry) => (
        <CardRow
          key={entry.id}
          action={
            <Button variant="ghost" onClick={() => onDelete(entry.id)}>
              Löschen
            </Button>
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {entry.title}
          </p>
          <p
            style={{
              margin: 'var(--md-space-1) 0 0',
              fontSize: 'var(--md-font-size-sm)',
              color: 'var(--md-color-on-surface-variant)'
            }}
          >
            {entry.type} · {formatDateTimeLabel(entry.startsAt)}
          </p>
        </CardRow>
      ))}
    </div>
  );
}
