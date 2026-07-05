import { Button } from '../atoms/Button';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminCalendarEntry } from '../../types/admin';

interface Props {
  entries: AdminCalendarEntry[];
  onDelete: (id: number) => void;
}

export function AdminCalendarList({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Keine Kalendereinträge vorhanden.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 'var(--md-radius-control)',
            background: 'var(--md-color-surface)',
            border: '1px solid var(--md-color-border)'
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{entry.title}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
              {entry.type} · {formatDateTimeLabel(entry.startsAt)}
            </p>
          </div>
          <Button variant="ghost" onClick={() => onDelete(entry.id)}>
            Löschen
          </Button>
        </div>
      ))}
    </div>
  );
}
