import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { fetchMyHousehold, updateMyHousehold } from '../../api/householdsApi';
import { DEFAULT_STATUSES } from '../../types/household';

interface Props {
  onSaved?: () => void;
}

export function HouseholdStatusForm({ onSaved }: Props) {
  const [statusKey, setStatusKey] = useState(0);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMyHousehold()
      .then((household) => {
        const index = DEFAULT_STATUSES.findIndex((status) => status.label === household.statusLabel);
        setStatusKey(index >= 0 ? index : 0);
        setNote(household.statusNote ?? '');
      })
      .catch(() => setMessage('Status konnte nicht geladen werden.'));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const status = DEFAULT_STATUSES[statusKey] ?? DEFAULT_STATUSES[0];

    try {
      await updateMyHousehold({
        statusEmoji: status.emoji,
        statusLabel: status.label,
        statusNote: note.trim() || null
      });
      setMessage('Status aktualisiert.');
      onSaved?.();
    } catch {
      setMessage('Status konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--md-space-3)' }}>
      <Select value={statusKey} onChange={(event) => setStatusKey(Number(event.target.value))}>
        {DEFAULT_STATUSES.map((status, index) => (
          <option key={status.label} value={index}>
            {status.emoji} {status.label}
          </option>
        ))}
      </Select>
      <Input
        placeholder="Notiz, z. B. bis 18 Uhr unterwegs"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={120}
      />
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Speichert...' : 'Status speichern'}
      </Button>
      {message && (
        <p style={{ margin: 0, color: message.includes('nicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {message}
        </p>
      )}
    </form>
  );
}
