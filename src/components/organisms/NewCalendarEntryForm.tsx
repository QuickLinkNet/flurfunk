import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { createCalendarEntry, updateCalendarEntry } from '../../api/calendarApi';
import { CALENDAR_TYPE_OPTIONS } from '../../utils/calendarTypeMeta';
import type { CalendarEntry } from '../../types/calendarEntry';

interface Props {
  initialDate?: string;
  entry?: CalendarEntry;
  onCreated: () => void;
  onCancel?: () => void;
}

function localDateTimeValue(date?: string): string {
  const value = date ? new Date(date) : new Date();
  value.setMinutes(Math.ceil(value.getMinutes() / 15) * 15, 0, 0);
  return value.toISOString().slice(0, 16);
}

function inputValue(value?: string | null): string {
  return value ? value.replace(' ', 'T').slice(0, 16) : '';
}

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function dateTimeFromDate(value: string): string {
  return value.length === 10 ? `${value}T09:00` : value;
}

export function NewCalendarEntryForm({ initialDate, entry, onCreated, onCancel }: Props) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [type, setType] = useState<CalendarEntry['type']>(entry?.type ?? 'appointment');
  const [startsAt, setStartsAt] = useState(() => inputValue(entry?.startsAt) || localDateTimeValue(initialDate));
  const [endsAt, setEndsAt] = useState(() => inputValue(entry?.endsAt));
  const [allDay, setAllDay] = useState(entry?.allDay ?? false);
  const [visibility, setVisibility] = useState<'public' | 'neighbors' | 'private'>(entry?.visibility ?? 'neighbors');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAllDayChange(checked: boolean) {
    setAllDay(checked);
    setStartsAt((value) => (checked ? dateOnly(value) : dateTimeFromDate(value)));
    setEndsAt((value) => (value ? (checked ? dateOnly(value) : dateTimeFromDate(value)) : ''));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!title.trim() || !startsAt) {
      setMessage('Titel und Startzeit sind Pflicht.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type,
        title: title.trim(),
        startsAt,
        endsAt: endsAt || null,
        allDay,
        visibility
      };
      if (entry) await updateCalendarEntry(Number(entry.id), payload);
      else await createCalendarEntry(payload);
      setTitle('');
      setEndsAt('');
      setMessage(entry ? 'Termin aktualisiert.' : 'Termin angelegt.');
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
        <input type="checkbox" checked={allDay} onChange={(event) => handleAllDayChange(event.target.checked)} />
        Ganztägig
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Speichert...' : entry ? 'Termin aktualisieren' : 'Termin speichern'}
      </Button>
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Abbrechen
        </Button>
      )}
      {message && (
        <p style={{ margin: 0, color: message.includes('nicht') || message.includes('Pflicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {message}
        </p>
      )}
    </form>
  );
}
