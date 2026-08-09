import { EventPollCard } from './EventPollCard';
import type { EventPoll } from '../../types/eventPoll';

interface Props {
  polls: EventPoll[];
}

export function EventPollList({ polls }: Props) {
  if (polls.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Noch keine Terminfindung gestartet.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {polls.map((poll) => (
        <EventPollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}
