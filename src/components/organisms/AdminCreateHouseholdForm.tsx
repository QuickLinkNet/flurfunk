import { useState, type FormEvent } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validPeople = people.filter((p) => p.firstName.trim() && p.lastName.trim());
    if (!name.trim() || !addressLine.trim() || validPeople.length === 0) return;
    setIsSubmitting(true);
    try {
      const result = await createAdminHousehold(name.trim(), addressLine.trim(), validPeople);
      setCreatedInvites(result.invites);
      setName('');
      setAddressLine('');
      setPeople([{ ...EMPTY_PERSON }]);
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-3)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-3)' }}>
        <Input placeholder="Haushaltsname (z.B. Familie Schneider)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Adresse" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
        {people.map((person, index) => (
          <div key={index} style={{ display: 'flex', gap: 'var(--md-space-2)' }}>
            <Input
              placeholder="Vorname"
              value={person.firstName}
              onChange={(e) => updatePerson(index, { firstName: e.target.value })}
            />
            <Input
              placeholder="Nachname"
              value={person.lastName}
              onChange={(e) => updatePerson(index, { lastName: e.target.value })}
            />
            {people.length > 1 && (
              <Button type="button" variant="ghost" onClick={() => removePersonRow(index)}>
                ×
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={addPersonRow}>
          + Person hinzufügen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird angelegt …' : 'Haushalt anlegen'}
        </Button>
      </form>
      {createdInvites && (
        <div
          style={{
            padding: 'var(--md-space-3)',
            borderRadius: 'var(--md-radius-control)',
            background: 'var(--md-color-secondary-container)'
          }}
        >
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-sm)', fontWeight: 'var(--md-font-weight-medium)' }}>
            Codes zum Verschicken:
          </p>
          {createdInvites.map((invite) => (
            <p key={invite.id} style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-sm)' }}>
              {invite.firstName} {invite.lastName}: <strong>{invite.code}</strong>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
