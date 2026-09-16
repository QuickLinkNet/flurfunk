import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { ActionDialog } from './ActionDialog';

interface Option {
  value: string;
  label: string;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

interface Props {
  open: boolean;
  title: string;
  nameLabel: string;
  initialName: string;
  typeValue?: string;
  typeOptions?: Option[];
  dateLabel?: string;
  dateValue?: string | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (name: string, typeValue?: string, dateValue?: string) => Promise<void>;
}

export function EditEntityDialog({
  open,
  title,
  nameLabel,
  initialName,
  typeValue,
  typeOptions,
  dateLabel,
  dateValue,
  loading = false,
  onClose,
  onSave
}: Props) {
  const [name, setName] = useState(initialName);
  const [nextType, setNextType] = useState(typeValue ?? '');
  const [nextDate, setNextDate] = useState(dateValue ?? '');

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setNextType(typeValue ?? '');
    setNextDate(dateValue ?? '');
  }, [initialName, open, typeValue, dateValue]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await onSave(trimmedName, nextType || undefined, dateLabel ? nextDate : undefined);
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
        {dateLabel && (
          <label className="profile-settings-field">
            <span>{dateLabel}</span>
            <Input type="date" value={nextDate} max={TODAY_ISO} onChange={(event) => setNextDate(event.target.value)} />
          </label>
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
