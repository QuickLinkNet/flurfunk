import { Button } from '../atoms/Button';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminEvent } from '../../types/admin';

interface Props {
  events: AdminEvent[];
  onDelete: (id: number) => void;
}

export function AdminEventList({ events, onDelete }: Props) {
  if (events.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Keine Events vorhanden.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {events.map((event) => (
        <div
          key={event.id}
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
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{event.title}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
              {event.creatorHouseholdName} · {formatDateTimeLabel(event.startsAt)} · {event.rsvpCounts.yes} Zusagen
            </p>
          </div>
          <Button variant="ghost" onClick={() => onDelete(event.id)}>
            Löschen
          </Button>
        </div>
      ))}
    </div>
  );
}
