import { useState, type FormEvent } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { PhotoPickerField } from '../molecules/PhotoPickerField';
import { createEvent, deleteEventPhoto, updateEvent, uploadEventPhoto } from '../../api/eventsApi';
import { EVENT_TYPE_OPTIONS } from '../../utils/eventTypeMeta';
import { recurrenceSummary } from '../../utils/recurrenceLabels';
import type { EventType, RecurrenceRule, StreetEvent } from '../../types/event';

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
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>(event?.recurrenceRule ?? 'none');
  const [recurrenceUntil, setRecurrenceUntil] = useState(() => event?.recurrenceUntil?.slice(0, 10) ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(event?.photoUrl ?? null);
  const [isPhotoBusy, setIsPhotoBusy] = useState(false);

  async function handleRemoveExistingPhoto() {
    if (!event) return;
    setIsPhotoBusy(true);
    try {
      await deleteEventPhoto(event.id);
      setExistingPhotoUrl(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Foto konnte nicht entfernt werden.');
    } finally {
      setIsPhotoBusy(false);
    }
  }

  async function handleReplaceExistingPhoto(file: File) {
    if (!event) return;
    setIsPhotoBusy(true);
    try {
      const result = await uploadEventPhoto(event.id, file);
      setExistingPhotoUrl(result.photoUrl);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Foto konnte nicht hochgeladen werden.');
    } finally {
      setIsPhotoBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (title.trim() === '' || startsAt === '') {
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
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        location: location || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        visibility,
        recurrenceRule,
        recurrenceUntil: recurrenceRule === 'none' ? null : recurrenceUntil || null
      };
      if (event) {
        await updateEvent(event.id, payload);
      } else {
        const result = await createEvent(payload);
        if (photoFile) {
          try {
            await uploadEventPhoto(result.id, photoFile);
          } catch {
            // Event ist schon erstellt, Foto ist nur ein Zusatz - nicht blockierend.
          }
        }
        setTitle('');
        setLocation('');
        setStartsAt('');
        setEndsAt('');
        setDescription('');
        setVisibility('neighbors');
        setRecurrenceRule('none');
        setRecurrenceUntil('');
        setPhotoFile(null);
        setPickerKey((key) => key + 1);
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
      <div className="md-form-grid">
        <Select value={recurrenceRule} onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}>
          <option value="none">Keine Wiederholung</option>
          <option value="daily">Täglich</option>
          <option value="weekly">Wöchentlich</option>
          <option value="monthly">Monatlich</option>
        </Select>
        <Input
          type="date"
          value={recurrenceUntil}
          disabled={recurrenceRule === 'none'}
          onChange={(e) => setRecurrenceUntil(e.target.value)}
        />
      </div>
      {recurrenceRule !== 'none' && (
        <p style={{ margin: 0, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
          Serie: {recurrenceSummary(recurrenceRule, recurrenceUntil || null)}
        </p>
      )}
      <Textarea
        placeholder="Beschreibung, Treffpunkt oder was mitgebracht werden soll (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={600}
      />
      {event ? (
        <div className="photo-picker-field">
          {existingPhotoUrl ? (
            <div className="photo-picker-preview">
              <img src={existingPhotoUrl} alt="" />
              <button type="button" disabled={isPhotoBusy} onClick={handleRemoveExistingPhoto}>
                Foto entfernen
              </button>
            </div>
          ) : (
            <PhotoPickerField
              key={pickerKey}
              label={isPhotoBusy ? 'Lädt...' : 'Foto hinzufügen'}
              onFileSelected={(file) => {
                if (file) {
                  handleReplaceExistingPhoto(file);
                  setPickerKey((key) => key + 1);
                }
              }}
            />
          )}
        </div>
      ) : (
        <PhotoPickerField key={pickerKey} onFileSelected={setPhotoFile} />
      )}
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
