import { CALENDAR_TYPE_META } from '../../utils/calendarTypeMeta';
import { Button } from '../atoms/Button';
import type { CalendarEntry } from '../../types/calendarEntry';

interface Props {
  entry: CalendarEntry;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value.replace(' ', 'T')));
}

export function CalendarEntryDetail({ entry, onClose, onEdit, onDelete }: Props) {
  const meta = CALENDAR_TYPE_META[entry.type];
  return (
    <section
      style={{
        display: 'grid',
        gap: 'var(--md-space-2)',
        padding: 'var(--md-space-3)',
        border: '1px solid var(--md-color-border)',
        borderRadius: 'var(--md-radius-card)',
        background: 'var(--md-color-surface)'
      }}
    >
      <div className="md-card-header">
        <div>
          <p style={{ margin: 0, color: meta.color, fontSize: 'var(--md-font-size-sm)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {meta.label}
          </p>
          <h2 style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-lg)' }}>{entry.title}</h2>
        </div>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', color: 'var(--md-color-on-surface-variant)' }}>
          Schließen
        </button>
      </div>
      <p style={{ margin: 0, color: 'var(--md-color-on-surface-variant)' }}>
        {entry.allDay ? 'Ganztägig' : formatDateTime(entry.startsAt)}
        {entry.endsAt ? ` bis ${entry.allDay ? entry.endsAt : formatDateTime(entry.endsAt)}` : ''}
      </p>
      {entry.canManage && (
        <div className="md-card-actions">
          <Button type="button" variant="ghost" onClick={onEdit}>
            Bearbeiten
          </Button>
          <Button type="button" variant="ghost" onClick={onDelete}>
            Löschen
          </Button>
        </div>
      )}
    </section>
  );
}
