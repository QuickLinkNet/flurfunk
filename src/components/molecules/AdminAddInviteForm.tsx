import { useState, type FormEvent } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { addAdminHouseholdInvite } from '../../api/adminApi';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Props {
  householdId: number;
  onAdded: (invite: HouseholdInvitePerson) => void;
}

export function AdminAddInviteForm({ householdId, onAdded }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setIsSubmitting(true);
    try {
      const invite = await addAdminHouseholdInvite(householdId, firstName.trim(), lastName.trim());
      onAdded(invite);
      setFirstName('');
      setLastName('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--md-space-2)', marginTop: 'var(--md-space-2)' }}>
      <Input placeholder="Vorname" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <Input placeholder="Nachname" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <Button type="submit" variant="ghost" disabled={isSubmitting}>
        + Person einladen
      </Button>
    </form>
  );
}
