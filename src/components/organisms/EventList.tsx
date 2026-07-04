import { EventCard } from './EventCard';
import type { StreetEvent } from '../../types/event';

interface Props {
  events: StreetEvent[];
}

export function EventList({ events }: Props) {
  if (events.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Noch keine Events geplant.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
