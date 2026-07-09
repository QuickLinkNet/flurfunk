import { Button } from '../atoms/Button';
import type { RsvpResponse } from '../../types/event';

interface Props {
  value: RsvpResponse | null;
  onChange: (response: RsvpResponse) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{ value: RsvpResponse; label: string }> = [
  { value: 'yes', label: 'Zusage' },
  { value: 'maybe', label: 'Vielleicht' },
  { value: 'no', label: 'Absage' }
];

export function RSVPButtonGroup({ value, onChange, disabled }: Props) {
  return (
    <div style={{ display: 'flex', gap: 'var(--md-space-2)' }}>
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'primary' : 'ghost'}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          style={{ flex: 1 }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
