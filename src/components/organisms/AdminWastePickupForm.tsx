import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { createCalendarEntry } from '../../api/calendarApi';

const WASTE_TYPES = ['Bioabfall', 'Gelber Sack', 'Altpapier', 'Restmüll', 'Altglas'] as const;
const REPEAT_OPTIONS = [
  { value: 'once', label: 'Einmalig' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'biweekly', label: 'Alle 2 Wochen' },
  { value: 'fourweekly', label: 'Alle 4 Wochen' },
  { value: 'monthly', label: 'Monatlich' }
] as const;

type RepeatOption = (typeof REPEAT_OPTIONS)[number]['value'];

interface Props {
  onCreated: () => void;
}

function tomorrowDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return dateValue(date);
}

function dateValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function pickupDates(startValue: string, repeat: RepeatOption): string[] {
  const start = new Date(`${startValue}T00:00:00`);
  const end = addMonths(start, 6);
  const dates: string[] = [];

  for (let current = start; current <= end; current = nextDate(current, repeat)) {
    dates.push(dateValue(current));
    if (repeat === 'once') break;
  }

  return dates;
}

function nextDate(current: Date, repeat: RepeatOption): Date {
  if (repeat === 'weekly') return addDays(current, 7);
  if (repeat === 'biweekly') return addDays(current, 14);
  if (repeat === 'fourweekly') return addDays(current, 28);
  if (repeat === 'monthly') return addMonths(current, 1);
  return addMonths(current, 7);
}

export function AdminWastePickupForm({ onCreated }: Props) {
  const [title, setTitle] = useState<(typeof WASTE_TYPES)[number]>('Bioabfall');
  const [date, setDate] = useState(tomorrowDate);
  const [repeat, setRepeat] = useState<RepeatOption>('once');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    if (!date) {
      setFeedback('Datum ist Pflicht.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dates = pickupDates(date, repeat);
      for (const pickupDate of dates) {
        await createCalendarEntry({
          type: 'trash',
          title,
          startsAt: `${pickupDate}T06:00`,
          endsAt: null,
          allDay: true,
          visibility: 'neighbors'
        });
      }
      setFeedback(dates.length === 1 ? 'Mülltermin angelegt.' : `${dates.length} Mülltermine angelegt.`);
      onCreated();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Mülltermin konnte nicht angelegt werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="md-action-row">
      <div className="md-form-grid">
        <Select value={title} onChange={(event) => setTitle(event.target.value as (typeof WASTE_TYPES)[number])}>
          {WASTE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <Select value={repeat} onChange={(event) => setRepeat(event.target.value as RepeatOption)}>
          {REPEAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Speichert...' : 'Mülltermin anlegen'}
      </Button>
      {feedback && <p style={{ margin: 0, color: feedback.includes('nicht') || feedback.includes('Pflicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>{feedback}</p>}
    </form>
  );
}
