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
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!firstName.trim() || !lastName.trim()) {
      setMessage('Bitte Vorname und Nachname ausfüllen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const invite = await addAdminHouseholdInvite(householdId, firstName.trim(), lastName.trim(), email.trim() || undefined);
      onAdded(invite);
      setFirstName('');
      setLastName('');
      setEmail('');
      setMessage(email.trim() ? 'Einladung angelegt. E-Mail kann jetzt gesendet werden.' : 'Einladung angelegt. Link oder Code können kopiert werden.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Person konnte nicht eingeladen werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-invite-form">
      <div className="admin-invite-form-header">
        <strong>Person einladen</strong>
        <span>E-Mail ist optional. Ohne E-Mail kannst du Code oder Link manuell weitergeben.</span>
      </div>
      <div className="admin-invite-form-grid">
        <label>
          <span>Vorname</span>
          <Input placeholder="Vorname" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </label>
        <label>
          <span>Nachname</span>
          <Input placeholder="Nachname" value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </label>
        <label>
          <span>E-Mail optional</span>
          <Input type="email" placeholder="person@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
      </div>
      <div className="admin-invite-form-actions">
        <Button type="submit" variant="secondary" disabled={isSubmitting}>
          {isSubmitting ? 'Wird angelegt...' : '+ Person einladen'}
        </Button>
        {message && <p data-error={message.includes('nicht') || message.includes('Bitte')}>{message}</p>}
      </div>
    </form>
  );
}
