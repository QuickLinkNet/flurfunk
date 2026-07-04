import { Link } from 'react-router-dom';
import { StatusEmoji } from '../atoms/StatusEmoji';
import { EVENT_TYPE_META } from '../../utils/eventTypeMeta';
import { formatDateTimeLabel } from '../../utils/date';
import type { StreetEvent } from '../../types/event';

interface Props {
  event: StreetEvent;
}

export function EventCard({ event }: Props) {
  const meta = EVENT_TYPE_META[event.type];
  return (
    <Link
      to={`/events/${event.id}`}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 'var(--md-radius-card)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <StatusEmoji emoji={meta.emoji} size={24} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{event.title}</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
          {meta.label} · {formatDateTimeLabel(event.startsAt)}
          {event.location ? ` · ${event.location}` : ''}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
          {event.rsvpCounts.yes} Zusagen · {event.rsvpCounts.maybe} vielleicht
        </p>
      </div>
    </Link>
  );
}
