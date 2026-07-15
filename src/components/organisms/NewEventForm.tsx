import { useState, type FormEvent } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { createEvent, updateEvent } from '../../api/eventsApi';
import { EVENT_TYPE_OPTIONS } from '../../utils/eventTypeMeta';
import type { EventType, StreetEvent } from '../../types/event';

interface Props {
  event?: StreetEvent;
  onCreated: () => void;
  onCancel?: () => void;
}

function inputDateTime(value?: string | null): string {
  return value ? value.replace(' ', 'T').slice(0, 16) : '';
}

export function NewEventForm({ event, onCreated, onCancel }: Props) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [type, setType] = useState<EventType>(event?.type ?? 'bbq');
  const [location, setLocation] = useState(event?.location ?? '');
  const [startsAt, setStartsAt] = useState(inputDateTime(event?.startsAt));
  const [endsAt, setEndsAt] = useState(inputDateTime(event?.endsAt));
  const [description, setDescription] = useState(event?.description ?? '');
  const [visibility, setVisibility] = useState<'public' | 'neighbors'>(event?.visibility ?? 'neighbors');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (title.trim() === '' || startsAt === '') {
      setMessage('Titel und Startzeit sind Pflicht.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        location: location || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        visibility
      };
      if (event) await updateEvent(event.id, payload);
      else {
        await createEvent(payload);
        setTitle('');
        setLocation('');
        setStartsAt('');
        setEndsAt('');
        setDescription('');
        setVisibility('neighbors');
      }
      onCreated();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Event konnte nicht gespeichert werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      <Input placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
      <div className="md-form-grid">
        <Select value={type} onChange={(e) => setType(e.target.value as EventType)}>
          {EVENT_TYPE_OPTIONS.map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.emoji} {meta.label}
            </option>
          ))}
        </Select>
        <Select value={visibility} onChange={(e) => setVisibility(e.target.value as 'public' | 'neighbors')}>
          <option value="neighbors">Nachbarschaft</option>
          <option value="public">Öffentlich</option>
        </Select>
      </div>
      <Input placeholder="Ort (optional)" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={160} />
      <div className="md-form-grid">
        <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        <Input type="datetime-local" value={endsAt} min={startsAt || undefined} onChange={(e) => setEndsAt(e.target.value)} />
      </div>
      <Textarea
        placeholder="Beschreibung, Treffpunkt oder was mitgebracht werden soll (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={600}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Speichert …' : event ? 'Event aktualisieren' : 'Event anlegen'}
      </Button>
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Abbrechen
        </Button>
      )}
      {message && (
        <p style={{ margin: 0, color: message.includes('Pflicht') || message.includes('nicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {message}
        </p>
      )}
    </form>
  );
}
