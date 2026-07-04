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
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Noch keine Rückmeldungen.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {responses.map((r) => (
        <div
          key={r.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--md-radius-control)',
            background: 'var(--md-color-surface)',
            border: '1px solid var(--md-color-border)'
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{r.householdName}</p>
            {describeAttendance(r) && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
                {describeAttendance(r)}
              </p>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>{RESPONSE_LABELS[r.response]}</span>
        </div>
      ))}
    </div>
  );
}
