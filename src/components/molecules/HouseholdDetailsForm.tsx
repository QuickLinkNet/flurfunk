import { forwardRef, useImperativeHandle, useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { HouseholdAvatar } from '../atoms/HouseholdAvatar';
import { Input } from '../atoms/Input';
import { HOUSEHOLD_AVATARS } from '../../utils/householdAvatar';

export interface HouseholdDetailsFormHandle {
  save: () => Promise<boolean>;
}

interface Props {
  initialName: string;
  initialAddressLine: string;
  initialAvatarKey?: string;
  showActions?: boolean;
  submitLabel?: string;
  onSave: (name: string, addressLine: string, avatarKey: string) => Promise<void>;
}

export const HouseholdDetailsForm = forwardRef<HouseholdDetailsFormHandle, Props>(function HouseholdDetailsForm(
  { initialName, initialAddressLine, initialAvatarKey = 'home', showActions = true, submitLabel = 'Speichern', onSave },
  ref
) {
  const [name, setName] = useState(initialName);
  const [addressLine, setAddressLine] = useState(initialAddressLine);
  const [avatarKey, setAvatarKey] = useState(initialAvatarKey);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(): Promise<boolean> {
    setMessage(null);
    if (!name.trim() || !addressLine.trim()) {
      setMessage('Haushaltsname und Adresse sind Pflicht.');
      return false;
    }

    setIsSaving(true);
    try {
      await onSave(name.trim(), addressLine.trim(), avatarKey);
      setMessage('Haushalt aktualisiert.');
      return true;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Haushalt konnte nicht gespeichert werden.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({ save }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await save();
  }

  return (
    <form onSubmit={handleSubmit} className="md-stack">
      <div className="household-avatar-picker" role="radiogroup" aria-label="Haushaltsavatar">
        {HOUSEHOLD_AVATARS.map((avatar) => (
          <button
            key={avatar.key}
            type="button"
            role="radio"
            aria-checked={avatarKey === avatar.key}
            data-active={avatarKey === avatar.key}
            onClick={() => setAvatarKey(avatar.key)}
          >
            <HouseholdAvatar avatarKey={avatar.key} fallback={avatar.label} size={42} />
            <span>{avatar.label}</span>
          </button>
        ))}
      </div>
      <div className="md-form-grid">
        <Input placeholder="Haushaltsname" value={name} onChange={(event) => setName(event.target.value)} />
        <Input placeholder="Adresse" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} />
      </div>
      {showActions && (
        <div className="md-card-actions">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Speichert...' : submitLabel}
          </Button>
        </div>
      )}
      {message && (
        <p style={{ margin: 0, color: message.includes('nicht') || message.includes('Pflicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {message}
        </p>
      )}
    </form>
  );
});
