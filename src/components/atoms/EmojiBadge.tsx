import type { CSSProperties } from 'react';

interface Props {
  emoji: string;
  className?: string;
  label?: string;
  size?: number;
  style?: CSSProperties;
}

export function EmojiBadge({ emoji, className, label, size = 38, style }: Props) {
  return (
    <span
      aria-label={label}
      className={className}
      role={label ? 'img' : undefined}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: 14,
        background: 'var(--md-color-primary-container)',
        fontSize: Math.round(size * 0.48),
        lineHeight: 1,
        flexShrink: 0,
        ...style
      }}
    >
      {emoji}
    </span>
  );
}
