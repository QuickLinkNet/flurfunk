import { Button } from '../atoms/Button';
import { CardRow } from '../molecules/CardRow';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminEvent } from '../../types/admin';

interface Props {
  events: AdminEvent[];
  onDelete: (id: number) => void;
}

export function AdminEventList({ events, onDelete }: Props) {
  if (events.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Keine Events vorhanden.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {events.map((event) => (
        <CardRow
          key={event.id}
          action={
            <Button variant="ghost" onClick={() => onDelete(event.id)}>
              Löschen
            </Button>
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {event.title}
          </p>
          <p
            style={{
              margin: 'var(--md-space-1) 0 0',
              fontSize: 'var(--md-font-size-sm)',
              color: 'var(--md-color-on-surface-variant)'
            }}
          >
            {event.creatorHouseholdName} · {formatDateTimeLabel(event.startsAt)} · {event.rsvpCounts.yes} Zusagen
          </p>
        </CardRow>
      ))}
    </div>
  );
}
