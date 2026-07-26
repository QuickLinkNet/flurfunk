import { StatusPill } from '../atoms/StatusPill';
import { AdminContentCard } from '../molecules/AdminContentCard';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { formatDateTimeLabel } from '../../utils/date';
import { EVENT_TYPE_META } from '../../utils/eventTypeMeta';
import { visibilityLabel, type Visibility } from '../../utils/visibility';
import type { AdminEvent } from '../../types/admin';
import type { EventType } from '../../types/event';

interface Props {
  events: AdminEvent[];
  onDelete: (event: AdminEvent) => void;
}

function normalizeDate(value: string): string {
  return value.replace(' ', 'T');
}

function adminVisibilityLabel(value: string): string {
  if (value === 'public' || value === 'neighbors' || value === 'private') {
    return visibilityLabel(value as Visibility);
  }

  return value;
}

function eventTypeLabel(value: string): string {
  if (value in EVENT_TYPE_META) {
    return EVENT_TYPE_META[value as EventType].label;
  }

  return value;
}

export function AdminEventList({ events, onDelete }: Props) {
  if (events.length === 0) {
    return <AdminEmptyState>Keine Events vorhanden.</AdminEmptyState>;
  }

  return (
    <div className="admin-content-list">
      {events.map((event) => (
        <AdminContentCard
          key={event.id}
          title={event.title}
          onDelete={() => onDelete(event)}
          meta={
            <>
              <StatusPill label={eventTypeLabel(event.type)} />
              <StatusPill label={adminVisibilityLabel(event.visibility)} />
              <StatusPill label={`${event.rsvpCounts.yes} Zusagen`} tone={event.rsvpCounts.yes > 0 ? 'success' : 'neutral'} />
              <StatusPill label={`${event.rsvpCounts.maybe} Vielleicht`} />
              <StatusPill label={`${event.rsvpCounts.no} Absagen`} />
            </>
          }
        >
          <p>Haushalt: {event.creatorHouseholdName}</p>
          <p>Start: {formatDateTimeLabel(normalizeDate(event.startsAt))}</p>
        </AdminContentCard>
      ))}
    </div>
  );
}
