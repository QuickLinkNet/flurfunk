import { StatusEmoji } from '../atoms/StatusEmoji';
import type { Household } from '../../types/household';

interface Props {
  household: Household;
  onClick?: () => void;
}

// Zeigt den aktuellen Status eines Haushalts (Dashboard, Straßen-Feed).
export function StatusCard({ household, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: 'var(--md-radius-card)',
        border: 'none',
        background: 'var(--md-color-primary-container)',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <StatusEmoji emoji={household.statusEmoji} size={28} />
      <div>
        <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{household.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
          {household.statusLabel}
        </p>
      </div>
    </button>
  );
}
