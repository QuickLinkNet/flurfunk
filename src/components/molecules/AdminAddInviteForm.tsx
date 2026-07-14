import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { addAdminHouseholdInvite } from '../../api/adminApi';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Props {
  householdId: number;
  onAdded: (invite: HouseholdInvitePerson) => void;
}

export function AdminAddInviteForm({ householdId, onAdded }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Bitte Vorname und Nachname ausfüllen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const invite = await addAdminHouseholdInvite(householdId, firstName.trim(), lastName.trim());
      onAdded(invite);
      setFirstName('');
      setLastName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Person konnte nicht eingeladen werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="md-stack" style={{ marginTop: 'var(--md-space-3)', gap: 'var(--md-space-2)' }}>
      <div className="md-action-row">
        <div className="md-form-grid">
          <Input placeholder="Vorname" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          <Input placeholder="Nachname" value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </div>
        <Button type="submit" variant="secondary" disabled={isSubmitting}>
          {isSubmitting ? 'Wird angelegt...' : '+ Person einladen'}
        </Button>
      </div>
      {error && <p style={{ margin: 0, color: 'var(--md-color-error)', fontSize: 'var(--md-font-size-sm)' }}>{error}</p>}
    </form>
  );
}
