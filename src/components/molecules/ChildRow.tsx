import { Select } from '../atoms/Select';
import { CardRow } from './CardRow';
import { CHILD_LOCATION_LABELS } from '../../types/child';
import type { Child, ChildLocation } from '../../types/child';

interface Props {
  child: Child;
  onLocationChange: (childId: number, location: ChildLocation) => void;
}

export function ChildRow({ child, onLocationChange }: Props) {
  return (
    <CardRow
      action={
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
      }
    >
      <span style={{ fontSize: 'var(--md-font-size-md)', fontWeight: 'var(--md-font-weight-medium)' }}>{child.name}</span>
    </CardRow>
  );
}
