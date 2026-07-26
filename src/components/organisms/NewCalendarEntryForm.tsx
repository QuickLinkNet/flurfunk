import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { createCalendarEntry, updateCalendarEntry } from '../../api/calendarApi';
import { CALENDAR_TYPE_OPTIONS } from '../../utils/calendarTypeMeta';
import { recurrenceSummary } from '../../utils/recurrenceLabels';
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
  const [recurrenceRule, setRecurrenceRule] = useState<CalendarEntry['recurrenceRule']>(entry?.recurrenceRule ?? 'none');
  const [recurrenceUntil, setRecurrenceUntil] = useState(() => entry?.recurrenceUntil?.slice(0, 10) ?? '');
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
    if (recurrenceRule !== 'none' && recurrenceUntil && recurrenceUntil < startsAt.slice(0, 10)) {
      setMessage('Das Ende der Wiederholung darf nicht vor dem Start liegen.');
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
        visibility,
        recurrenceRule,
        recurrenceUntil: recurrenceRule === 'none' ? null : recurrenceUntil || null
      };
      if (entry) await updateCalendarEntry(Number(entry.id), payload);
      else await createCalendarEntry(payload);
      setTitle('');
      setEndsAt('');
      setMessage(entry ? 'Termin aktualisiert.' : 'Termin angelegt.');
      onCreated();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Termin konnte nicht gespeichert werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="calendar-entry-form">
      <label className="calendar-form-field calendar-form-field--wide">
        <span>Titel</span>
        <Input placeholder="z. B. Straßenfest, Urlaub, Mülltermin" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <div className="calendar-form-grid">
        <label className="calendar-form-field">
          <span>Kategorie</span>
          <Select value={type} onChange={(event) => setType(event.target.value as CalendarEntry['type'])}>
            {CALENDAR_TYPE_OPTIONS.map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="calendar-form-field">
          <span>Sichtbarkeit</span>
          <Select value={visibility} onChange={(event) => setVisibility(event.target.value as 'public' | 'neighbors' | 'private')}>
            <option value="neighbors">Nachbarschaft</option>
            <option value="public">Öffentlich</option>
            <option value="private">Privat</option>
          </Select>
        </label>
      </div>

      <div className="calendar-form-grid">
        <label className="calendar-form-field">
          <span>Start</span>
          <Input type={allDay ? 'date' : 'datetime-local'} value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
        </label>
        <label className="calendar-form-field">
          <span>Ende optional</span>
          <Input type={allDay ? 'date' : 'datetime-local'} value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
        </label>
      </div>

      <label className="calendar-check-field">
        <input type="checkbox" checked={allDay} onChange={(event) => handleAllDayChange(event.target.checked)} />
        Ganztägig
      </label>

      <div className="calendar-form-grid">
        <label className="calendar-form-field">
          <span>Wiederholung</span>
          <Select value={recurrenceRule} onChange={(event) => setRecurrenceRule(event.target.value as CalendarEntry['recurrenceRule'])}>
            <option value="none">Keine Wiederholung</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
            <option value="monthly">Monatlich</option>
          </Select>
        </label>
        <label className="calendar-form-field">
          <span>Wiederholen bis</span>
          <Input
            type="date"
            value={recurrenceUntil}
            disabled={recurrenceRule === 'none'}
            onChange={(event) => setRecurrenceUntil(event.target.value)}
          />
        </label>
      </div>

      {recurrenceRule !== 'none' && (
        <p className="calendar-form-hint">
          Serie: {recurrenceSummary(recurrenceRule, recurrenceUntil || null)}
        </p>
      )}

      <div className="calendar-form-actions">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Speichert...' : entry ? 'Termin aktualisieren' : 'Termin speichern'}
        </Button>
      </div>

      {message && (
        <p className="calendar-form-message" data-error={message.includes('nicht') || message.includes('Pflicht')}>
          {message}
        </p>
      )}
    </form>
  );
}
