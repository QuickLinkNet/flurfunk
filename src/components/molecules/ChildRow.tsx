import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import { CardRow } from './CardRow';
import { CHILD_LOCATION_LABELS } from '../../types/child';
import type { Child, ChildLocation } from '../../types/child';

interface Props {
  child: Child;
  onLocationChange: (childId: number, location: ChildLocation) => void;
  onRename?: (child: Child) => void;
  onDelete?: (childId: number) => void;
}

export function ChildRow({ child, onLocationChange, onRename, onDelete }: Props) {
  return (
    <CardRow
      action={
        <div className="inline-actions">
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
          {onRename && (
            <Button type="button" variant="ghost" onClick={() => onRename(child)}>
              Bearbeiten
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="ghost" onClick={() => onDelete(child.id)}>
              Entfernen
            </Button>
          )}
        </div>
      }
    >
      <span style={{ fontSize: 'var(--md-font-size-md)', fontWeight: 'var(--md-font-weight-medium)' }}>{child.name}</span>
    </CardRow>
  );
}
