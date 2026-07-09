import { IconBadge } from '../atoms/IconBadge';
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
        gap: 'var(--md-space-3)',
        width: '100%',
        textAlign: 'left',
        padding: 'var(--md-space-4)',
        borderRadius: 'var(--md-radius-card)',
        border: 'none',
        background: 'var(--md-color-surface)',
        boxShadow: 'var(--md-shadow-card)',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <IconBadge emoji={household.statusEmoji} tint="primary" size={44} />
      <div>
        <p
          style={{
            margin: 0,
            fontWeight: 'var(--md-font-weight-medium)',
            fontSize: 'var(--md-font-size-md)'
          }}
        >
          {household.name}
        </p>
        <p
          style={{
            margin: 'var(--md-space-1) 0 0',
            fontSize: 'var(--md-font-size-sm)',
            color: 'var(--md-color-on-surface-variant)'
          }}
        >
          {household.statusLabel}
        </p>
      </div>
    </button>
  );
}
