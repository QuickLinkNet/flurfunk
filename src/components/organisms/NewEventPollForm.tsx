import { useState, type FormEvent } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { createEventPoll } from '../../api/eventPollApi';
import { EVENT_TYPE_OPTIONS } from '../../utils/eventTypeMeta';
import type { EventType } from '../../types/event';

interface Props {
  onCreated: () => void;
}

const MIN_DATES = 2;
const MAX_DATES = 5;

export function NewEventPollForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('bbq');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'neighbors'>('neighbors');
  const [dates, setDates] = useState<string[]>(['', '']);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateDate(index: number, value: string) {
    setDates((current) => current.map((entry, i) => (i === index ? value : entry)));
  }

  function addDate() {
    if (dates.length >= MAX_DATES) return;
    setDates((current) => [...current, '']);
  }

  function removeDate(index: number) {
    if (dates.length <= MIN_DATES) return;
    setDates((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    const filledDates = dates.filter((d) => d.trim() !== '');
    if (title.trim() === '') {
      setMessage('Titel ist Pflicht.');
      return;
    }
    if (filledDates.length < MIN_DATES) {
      setMessage(`Bitte mindestens ${MIN_DATES} Terminvorschläge angeben.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createEventPoll({
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        visibility,
        dates: filledDates.map((d) => new Date(d).toISOString())
      });
      setTitle('');
      setLocation('');
      setDescription('');
      setVisibility('neighbors');
      setDates(['', '']);
      setMessage(`Terminfindung erstellt.${result.push && result.push.total > 0 ? ` Push: ${result.push.sent}/${result.push.total}.` : ''}`);
      onCreated();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Terminfindung konnte nicht erstellt werden.');
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

      <div style={{ display: 'grid', gap: 'var(--md-space-2)' }}>
        <span style={{ fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
          Terminvorschläge ({MIN_DATES}-{MAX_DATES})
        </span>
        {dates.map((date, index) => (
          <div key={index} style={{ display: 'flex', gap: 'var(--md-space-2)', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input type="datetime-local" value={date} onChange={(e) => updateDate(index, e.target.value)} />
            </div>
            {dates.length > MIN_DATES && (
              <Button type="button" variant="ghost" onClick={() => removeDate(index)}>
                Entfernen
              </Button>
            )}
          </div>
        ))}
        {dates.length < MAX_DATES && (
          <Button type="button" variant="ghost" onClick={addDate}>
            + Weiterer Termin
          </Button>
        )}
      </div>

      <Textarea
        placeholder="Beschreibung, Treffpunkt oder was mitgebracht werden soll (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={600}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Wird erstellt …' : 'Terminfindung starten'}
      </Button>
      {message && (
        <p style={{ margin: 0, color: message.includes('Pflicht') || message.includes('nicht') || message.includes('mindestens') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {message}
        </p>
      )}
    </form>
  );
}
