import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { fetchMyHousehold, updateMyHousehold } from '../../api/householdsApi';

export function HouseholdContactForm() {
  const [contactNote, setContactNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMyHousehold()
      .then((household) => setContactNote(household.contactNote ?? ''))
      .catch(() => setMessage('Kontakthinweis konnte nicht geladen werden.'));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await updateMyHousehold({ contactNote: contactNote.trim() || null });
      setMessage('Kontakthinweis gespeichert.');
    } catch {
      setMessage('Kontakthinweis konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--md-space-3)' }}>
      <p style={{ margin: 0, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
        Optional: Wie sollen Nachbarn euch erreichen? Wird nur gezeigt, wenn ihr das unter „Sichtbarkeit“ freigebt.
      </p>
      <Textarea
        placeholder="z. B. Tel. 0170 1234567, am liebsten anrufen statt klingeln"
        value={contactNote}
        rows={2}
        maxLength={200}
        onChange={(event) => setContactNote(event.target.value)}
        style={{ minHeight: 64 }}
      />
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Speichert...' : 'Kontakthinweis speichern'}
      </Button>
      {message && (
        <p style={{ margin: 0, color: message.includes('nicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {message}
        </p>
      )}
    </form>
  );
}
