import { Link } from 'react-router-dom';
import { IconBadge } from '../atoms/IconBadge';
import { EVENT_TYPE_META } from '../../utils/eventTypeMeta';
import { formatDateRangeLabel } from '../../utils/date';
import { RECURRENCE_LABELS } from '../../utils/recurrenceLabels';
import type { StreetEvent } from '../../types/event';

interface Props {
  event: StreetEvent;
}

export function EventCard({ event }: Props) {
  const meta = EVENT_TYPE_META[event.type];
  const isRecurring = event.recurrenceRule !== 'none';
  const displayStartsAt = event.nextOccurrenceAt ?? event.startsAt;
  return (
    <Link
      to={`/events/${event.id}`}
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
      {event.photoUrl ? (
        <img
          src={event.photoUrl}
          alt=""
          loading="lazy"
          style={{ width: 56, height: 56, borderRadius: 'var(--md-radius-control)', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <IconBadge emoji={meta.emoji} tint={meta.tint} />
      )}
      <div style={{ flex: 1 }}>
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
          {meta.label} · {formatDateRangeLabel(displayStartsAt, isRecurring ? null : event.endsAt)}
          {event.location ? ` · ${event.location}` : ''}
          {isRecurring ? ` · ${RECURRENCE_LABELS[event.recurrenceRule]}` : ''}
        </p>
        <p
          style={{
            margin: 'var(--md-space-2) 0 0',
            fontSize: 'var(--md-font-size-sm)',
            color: 'var(--md-color-on-surface-variant)'
          }}
        >
          {event.rsvpCounts.yes} Zusagen · {event.rsvpCounts.maybe} vielleicht
        </p>
      </div>
    </Link>
  );
}
