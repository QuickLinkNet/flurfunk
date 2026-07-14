import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { createCalendarEntry } from '../../api/calendarApi';
import { CALENDAR_TYPE_OPTIONS } from '../../utils/calendarTypeMeta';
import type { CalendarEntry } from '../../types/calendarEntry';

interface Props {
  initialDate?: string;
  onCreated: () => void;
}

function localDateTimeValue(date?: string): string {
  const value = date ? new Date(date) : new Date();
  value.setMinutes(Math.ceil(value.getMinutes() / 15) * 15, 0, 0);
  return value.toISOString().slice(0, 16);
}

export function NewCalendarEntryForm({ initialDate, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEntry['type']>('appointment');
  const [startsAt, setStartsAt] = useState(() => localDateTimeValue(initialDate));
  const [endsAt, setEndsAt] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'neighbors' | 'private'>('neighbors');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!title.trim() || !startsAt) {
      setMessage('Titel und Startzeit sind Pflicht.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCalendarEntry({
        type,
        title: title.trim(),
        startsAt,
        endsAt: endsAt || null,
        allDay,
        visibility
      });
      setTitle('');
      setEndsAt('');
      setMessage('Termin angelegt.');
      onCreated();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Termin konnte nicht angelegt werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="md-stack">
      <Input placeholder="Titel" value={title} onChange={(event) => setTitle(event.target.value)} />
      <div className="md-form-grid">
        <Select value={type} onChange={(event) => setType(event.target.value as CalendarEntry['type'])}>
          {CALENDAR_TYPE_OPTIONS.map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </Select>
        <Select value={visibility} onChange={(event) => setVisibility(event.target.value as 'public' | 'neighbors' | 'private')}>
          <option value="neighbors">Nachbarschaft</option>
          <option value="public">Öffentlich</option>
          <option value="private">Privat</option>
        </Select>
      </div>
      <div className="md-form-grid">
        <Input type={allDay ? 'date' : 'datetime-local'} value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
        <Input type={allDay ? 'date' : 'datetime-local'} value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-space-2)', fontSize: 'var(--md-font-size-sm)' }}>
        <input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />
        Ganztägig
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Speichert...' : 'Termin speichern'}
      </Button>
      {message && (
        <p style={{ margin: 0, color: message.includes('nicht') || message.includes('Pflicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {message}
        </p>
      )}
    </form>
  );
}
