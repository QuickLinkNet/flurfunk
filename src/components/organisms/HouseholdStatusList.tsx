import { StatusCard } from '../molecules/StatusCard';
import type { Household } from '../../types/household';

interface Props {
  households: Household[];
}

// Liste aller sichtbaren Haushalte für das Dashboard (Kapitel 8, Wireframe).
export function HouseholdStatusList({ households }: Props) {
  if (households.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Noch keine Haushalte sichtbar.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {households.map((h) => (
        <StatusCard key={h.id} household={h} />
      ))}
    </div>
  );
}
