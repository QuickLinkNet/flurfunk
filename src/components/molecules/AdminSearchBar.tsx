import { Input } from '../atoms/Input';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AdminSearchBar({ value, onChange }: Props) {
  return (
    <div className="admin-search">
      <Input
        placeholder="Admin-Suche: Haushalt, Name, E-Mail, Code..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
