import type { CSSProperties } from 'react';

type Tone = 'neutral' | 'success';

interface Props {
  label: string;
  tone?: Tone;
}

const COLORS: Record<Tone, CSSProperties> = {
  neutral: {
    background: 'var(--md-color-surface-variant)',
    color: 'var(--md-color-on-surface-variant)',
    border: '1px solid var(--md-color-border)'
  },
  success: {
    background: 'var(--md-color-secondary-container)',
    color: 'var(--md-color-secondary)',
    border: '1px solid var(--md-color-secondary-container)'
  }
};

export function StatusPill({ label, tone = 'neutral' }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 28,
        padding: '0 var(--md-space-3)',
        borderRadius: 999,
        fontSize: 'var(--md-font-size-sm)',
        fontWeight: 'var(--md-font-weight-medium)',
        whiteSpace: 'nowrap',
        ...COLORS[tone]
      }}
    >
      {label}
    </span>
  );
}
