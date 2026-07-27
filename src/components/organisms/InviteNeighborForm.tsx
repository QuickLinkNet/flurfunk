import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { NeighborInviteResult } from '../molecules/NeighborInviteResult';
import { inviteNeighbor } from '../../api/householdsApi';
import type { HouseholdInvitePerson } from '../../types/invite';

export function InviteNeighborForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInvite, setCreatedInvite] = useState<HouseholdInvitePerson | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !addressLine.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Bitte Haushalt, Adresse, Vor- und Nachname ausfüllen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await inviteNeighbor({
        name: name.trim(),
        addressLine: addressLine.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined
      });
      setCreatedInvite(result.invite);
      setName('');
      setAddressLine('');
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Einladung konnte nicht erstellt werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <Button type="button" onClick={() => setIsOpen(true)}>
        + Nachbar einladen
      </Button>
    );
  }

  return (
    <div className="admin-create-household">
      <p>Lade einen echten Nachbarn aus deiner Straße ein. Er bekommt einen eigenen Code, mit dem er sich direkt registrieren kann.</p>
      <form onSubmit={handleSubmit} className="admin-create-household-form">
        <div className="admin-invite-form-grid">
          <label>
            <span>Haushaltsname</span>
            <Input placeholder="z. B. Familie Schneider" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Adresse</span>
            <Input placeholder="Straße und Hausnummer" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} />
          </label>
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

        {error && <p className="admin-form-message" data-error>{error}</p>}

        <div className="md-card-actions">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Wird angelegt...' : 'Einladung erstellen'}
          </Button>
        </div>
      </form>

      {createdInvite && (
        <section className="admin-created-invites">
          <p>Einladung erstellt — Code oder Link an {createdInvite.firstName} weitergeben</p>
          <div className="admin-invite-list">
            <NeighborInviteResult invite={createdInvite} />
          </div>
        </section>
      )}
    </div>
  );
}
