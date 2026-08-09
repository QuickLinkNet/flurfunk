import { Link } from 'react-router-dom';
import { IconBadge } from '../atoms/IconBadge';
import { StatusPill } from '../atoms/StatusPill';
import { EVENT_TYPE_META } from '../../utils/eventTypeMeta';
import type { EventPoll } from '../../types/eventPoll';

interface Props {
  poll: EventPoll;
}

export function EventPollCard({ poll }: Props) {
  const meta = EVENT_TYPE_META[poll.type];
  const answered = poll.options.filter((o) => o.myResponse !== null).length;

  return (
    <Link
      to={`/terminfindung/${poll.id}`}
      style={{
        display: 'flex',
        gap: 'var(--md-space-3)',
        padding: 'var(--md-space-3) var(--md-space-4)',
        borderRadius: 'var(--md-radius-card)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)',
        boxShadow: 'var(--md-shadow-card)',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <IconBadge emoji={meta.emoji} tint={meta.tint} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-space-2)', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {poll.title}
          </p>
          <StatusPill
            label={poll.status === 'open' ? `${answered}/${poll.options.length} beantwortet` : 'Termin steht'}
            tone={poll.status === 'closed' ? 'success' : 'neutral'}
          />
        </div>
        <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
          {meta.label} · {poll.options.length} Terminvorschläge · von {poll.creatorHouseholdName}
        </p>
      </div>
    </Link>
  );
}
