import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { InviteCodeRow } from '../molecules/InviteCodeRow';
import { createAdminHousehold } from '../../api/adminApi';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Person {
  firstName: string;
  lastName: string;
}

interface Props {
  onCreated: () => void;
}

const EMPTY_PERSON: Person = { firstName: '', lastName: '' };

export function AdminCreateHouseholdForm({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [people, setPeople] = useState<Person[]>([{ ...EMPTY_PERSON }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInvites, setCreatedInvites] = useState<HouseholdInvitePerson[] | null>(null);

  function updatePerson(index: number, patch: Partial<Person>) {
    setPeople((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function addPersonRow() {
    setPeople((prev) => [...prev, { ...EMPTY_PERSON }]);
  }

  function removePersonRow(index: number) {
    setPeople((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validPeople = people.filter((p) => p.firstName.trim() && p.lastName.trim());
    setError(null);
    if (!name.trim() || !addressLine.trim() || validPeople.length === 0) {
      setError('Bitte Haushalt, Adresse und mindestens eine Person ausfüllen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAdminHousehold(name.trim(), addressLine.trim(), validPeople);
      setCreatedInvites(result.invites);
      setName('');
      setAddressLine('');
      setPeople([{ ...EMPTY_PERSON }]);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Haushalt konnte nicht angelegt werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="md-stack">
      <form onSubmit={handleSubmit} className="md-stack">
        <div className="md-form-grid">
          <Input placeholder="Haushaltsname (z. B. Familie Schneider)" value={name} onChange={(event) => setName(event.target.value)} />
          <Input placeholder="Adresse" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} />
        </div>

        <div className="md-stack" style={{ gap: 'var(--md-space-2)' }}>
          {people.map((person, index) => (
            <div key={index} className="md-action-row">
              <div className="md-form-grid">
                <Input
                  placeholder="Vorname"
                  value={person.firstName}
                  onChange={(event) => updatePerson(index, { firstName: event.target.value })}
                />
                <Input
                  placeholder="Nachname"
                  value={person.lastName}
                  onChange={(event) => updatePerson(index, { lastName: event.target.value })}
                />
              </div>
              {people.length > 1 && (
                <Button type="button" variant="ghost" onClick={() => removePersonRow(index)}>
                  Entfernen
                </Button>
              )}
            </div>
          ))}
        </div>

        {error && <p style={{ margin: 0, color: 'var(--md-color-error)', fontSize: 'var(--md-font-size-sm)' }}>{error}</p>}

        <div className="md-card-actions">
          <Button type="button" variant="ghost" onClick={addPersonRow}>
            + Person hinzufügen
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Wird angelegt...' : 'Haushalt anlegen'}
          </Button>
        </div>
      </form>

      {createdInvites && (
        <section
          style={{
            padding: 'var(--md-space-3)',
            borderRadius: 'var(--md-radius-control)',
            background: 'var(--md-color-secondary-container)'
          }}
        >
          <p style={{ margin: '0 0 var(--md-space-2)', fontSize: 'var(--md-font-size-sm)', fontWeight: 'var(--md-font-weight-medium)' }}>
            Neue Codes zum Verschicken
          </p>
          <div className="md-stack" style={{ gap: 'var(--md-space-2)' }}>
            {createdInvites.map((invite) => (
              <InviteCodeRow key={invite.id} invite={invite} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
