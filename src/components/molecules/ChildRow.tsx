import { Select } from '../atoms/Select';
import { CHILD_LOCATION_LABELS } from '../../types/child';
import type { Child, ChildLocation } from '../../types/child';

interface Props {
  child: Child;
  onLocationChange: (childId: number, location: ChildLocation) => void;
}

export function ChildRow({ child, onLocationChange }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 'var(--md-radius-control)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)'
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500 }}>{child.name}</span>
      <Select
        value={child.currentLocation}
        onChange={(e) => onLocationChange(child.id, e.target.value as ChildLocation)}
        style={{ width: 'auto' }}
      >
        {Object.entries(CHILD_LOCATION_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
