import { EventCard } from './EventCard';
import type { StreetEvent } from '../../types/event';

interface Props {
  events: StreetEvent[];
}

export function EventList({ events }: Props) {
  if (events.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Noch keine Events geplant.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
