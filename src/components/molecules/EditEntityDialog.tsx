import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { ActionDialog } from './ActionDialog';

interface Option {
  value: string;
  label: string;
}

interface Props {
  open: boolean;
  title: string;
  nameLabel: string;
  initialName: string;
  typeValue?: string;
  typeOptions?: Option[];
  loading?: boolean;
  onClose: () => void;
  onSave: (name: string, typeValue?: string) => Promise<void>;
}

export function EditEntityDialog({
  open,
  title,
  nameLabel,
  initialName,
  typeValue,
  typeOptions,
  loading = false,
  onClose,
  onSave
}: Props) {
  const [name, setName] = useState(initialName);
  const [nextType, setNextType] = useState(typeValue ?? '');

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setNextType(typeValue ?? '');
  }, [initialName, open, typeValue]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await onSave(trimmedName, nextType || undefined);
  }

  return (
    <ActionDialog open={open} title={title} onClose={onClose}>
      <form className="compact-manager" onSubmit={handleSubmit}>
        <Input placeholder={nameLabel} value={name} onChange={(event) => setName(event.target.value)} />
        {typeOptions && (
          <Select value={nextType} onChange={(event) => setNextType(event.target.value)}>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
        <div className="md-card-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Speichert ...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </ActionDialog>
  );
}
