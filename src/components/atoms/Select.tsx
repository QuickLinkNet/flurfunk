import type { SelectHTMLAttributes } from 'react';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%',
        padding: 'var(--md-space-3)',
        borderRadius: 'var(--md-radius-control)',
        border: '1px solid var(--md-color-border)',
        fontSize: 'var(--md-font-size-md)',
        background: 'var(--md-color-surface)',
        color: 'var(--md-color-on-surface)',
        ...props.style
      }}
    />
  );
}
