import { Select } from '../atoms/Select';

export type FeedExpiryOption = 'none' | 'today' | 'tomorrow' | 'week';

interface Props {
  value: FeedExpiryOption;
  onChange: (value: FeedExpiryOption) => void;
}

export function feedExpiryDate(option: FeedExpiryOption): string | undefined {
  if (option === 'none') return undefined;
  const date = new Date();
  if (option === 'today') date.setHours(23, 59, 0, 0);
  if (option === 'tomorrow') {
    date.setDate(date.getDate() + 1);
    date.setHours(23, 59, 0, 0);
  }
  if (option === 'week') {
    date.setDate(date.getDate() + 7);
    date.setHours(23, 59, 0, 0);
  }
  return date.toISOString();
}

export function FeedExpirySelect({ value, onChange }: Props) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value as FeedExpiryOption)}>
      <option value="today">Bis heute Abend</option>
      <option value="tomorrow">Bis morgen Abend</option>
      <option value="week">Eine Woche</option>
      <option value="none">Ohne Ablauf</option>
    </Select>
  );
}
