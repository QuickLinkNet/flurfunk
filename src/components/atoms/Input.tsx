import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        minHeight: 48,
        padding: 'var(--md-space-3) var(--md-space-4)',
        borderRadius: 'var(--md-radius-control)',
        border: '1px solid var(--md-color-border)',
        fontFamily: 'inherit',
        fontSize: 'var(--md-font-size-md)',
        background: 'var(--md-color-surface)',
        color: 'var(--md-color-on-surface)',
        outlineColor: 'var(--md-color-primary)',
        ...props.style
      }}
    />
  );
}
