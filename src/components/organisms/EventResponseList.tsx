import { CardRow } from '../molecules/CardRow';
import type { EventResponseEntry } from '../../types/event';

interface Props {
  responses: EventResponseEntry[];
}

const RESPONSE_LABELS: Record<EventResponseEntry['response'], string> = {
  yes: 'Zusage',
  maybe: 'Vielleicht',
  no: 'Absage'
};

function describeAttendance(r: EventResponseEntry): string {
  if (r.note) return r.note;
  if (r.adultsCount != null || r.childrenCount != null) {
    const parts = [];
    if (r.adultsCount) parts.push(`${r.adultsCount} Erwachsene`);
    if (r.childrenCount) parts.push(`${r.childrenCount} Kinder`);
    return parts.join(', ');
  }
  return '';
}

export function EventResponseList({ responses }: Props) {
  if (responses.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Noch keine Rückmeldungen.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {responses.map((r) => (
        <CardRow
          key={r.id}
          action={
            <span style={{ fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
              {RESPONSE_LABELS[r.response]}
            </span>
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {r.householdName}
          </p>
          {describeAttendance(r) && (
            <p
              style={{
                margin: 'var(--md-space-1) 0 0',
                fontSize: 'var(--md-font-size-sm)',
                color: 'var(--md-color-on-surface-variant)'
              }}
            >
              {describeAttendance(r)}
            </p>
          )}
        </CardRow>
      ))}
    </div>
  );
}
