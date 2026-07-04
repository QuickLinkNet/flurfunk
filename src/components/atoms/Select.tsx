import type { SelectHTMLAttributes } from 'react';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 'var(--md-radius-control)',
        border: '1px solid var(--md-color-border)',
        fontSize: 14,
        background: 'var(--md-color-surface)',
        color: 'var(--md-color-on-surface)',
        ...props.style
      }}
    />
  );
}
