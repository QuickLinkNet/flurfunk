import { AdminDeleteButton } from '../molecules/AdminDeleteButton';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { AdminListStack } from '../molecules/AdminListStack';
import { CardRow } from '../molecules/CardRow';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminEvent } from '../../types/admin';

interface Props {
  events: AdminEvent[];
  onDelete: (event: AdminEvent) => void;
}

export function AdminEventList({ events, onDelete }: Props) {
  if (events.length === 0) {
    return <AdminEmptyState>Keine Events vorhanden.</AdminEmptyState>;
  }

  return (
    <AdminListStack>
      {events.map((event) => (
        <CardRow key={event.id} action={<AdminDeleteButton onClick={() => onDelete(event)} />}>
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {event.title}
          </p>
          <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
            {event.creatorHouseholdName} · {formatDateTimeLabel(event.startsAt)} · {event.rsvpCounts.yes} Zusagen
          </p>
        </CardRow>
      ))}
    </AdminListStack>
  );
}
