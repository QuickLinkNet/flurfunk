import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { InviteCodeRow } from '../molecules/InviteCodeRow';
import { createAdminHousehold } from '../../api/adminApi';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Person {
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  onCreated: () => void;
}

const EMPTY_PERSON: Person = { firstName: '', lastName: '', email: '' };

export function AdminCreateHouseholdForm({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [people, setPeople] = useState<Person[]>([{ ...EMPTY_PERSON }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInvites, setCreatedInvites] = useState<HouseholdInvitePerson[] | null>(null);

  function updatePerson(index: number, patch: Partial<Person>) {
    setPeople((prev) => prev.map((person, i) => (i === index ? { ...person, ...patch } : person)));
  }

  function addPersonRow() {
    setPeople((prev) => [...prev, { ...EMPTY_PERSON }]);
  }

  function removePersonRow(index: number) {
    setPeople((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validPeople = people
      .filter((person) => person.firstName.trim() && person.lastName.trim())
      .map((person) => ({
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        email: person.email.trim() || undefined
      }));
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
    <div className="admin-create-household">
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

        <div className="admin-create-people">
          {people.map((person, index) => (
            <div key={index} className="admin-create-person-row">
              <div className="admin-invite-form-grid">
                <label>
                  <span>Vorname</span>
                  <Input
                    placeholder="Vorname"
                    value={person.firstName}
                    onChange={(event) => updatePerson(index, { firstName: event.target.value })}
                  />
                </label>
                <label>
                  <span>Nachname</span>
                  <Input
                    placeholder="Nachname"
                    value={person.lastName}
                    onChange={(event) => updatePerson(index, { lastName: event.target.value })}
                  />
                </label>
                <label>
                  <span>E-Mail optional</span>
                  <Input
                    type="email"
                    placeholder="person@example.com"
                    value={person.email}
                    onChange={(event) => updatePerson(index, { email: event.target.value })}
                  />
                </label>
              </div>
              {people.length > 1 && (
                <Button type="button" variant="ghost" onClick={() => removePersonRow(index)}>
                  Entfernen
                </Button>
              )}
            </div>
          ))}
        </div>

        {error && <p className="admin-form-message" data-error>{error}</p>}

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
        <section className="admin-created-invites">
          <p>Neue Codes zum Verschicken</p>
          <div className="admin-invite-list">
            {createdInvites.map((invite) => (
              <InviteCodeRow key={invite.id} invite={invite} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
