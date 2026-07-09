import { useState, type FormEvent } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createEvent } from '../../api/eventsApi';
import { EVENT_TYPE_OPTIONS } from '../../utils/eventTypeMeta';
import type { EventType } from '../../types/event';

interface Props {
  onCreated: () => void;
}

export function NewEventForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('bbq');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (title.trim() === '' || startsAt === '') return;
    setIsSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        type,
        location: location || undefined,
        startsAt: new Date(startsAt).toISOString()
      });
      setTitle('');
      setLocation('');
      setStartsAt('');
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      <Input placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
      <Select value={type} onChange={(e) => setType(e.target.value as EventType)}>
        {EVENT_TYPE_OPTIONS.map(([value, meta]) => (
          <option key={value} value={value}>
            {meta.emoji} {meta.label}
          </option>
        ))}
      </Select>
      <Input placeholder="Ort (optional)" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={160} />
      <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Wird angelegt …' : 'Event anlegen'}
      </Button>
    </form>
  );
}
