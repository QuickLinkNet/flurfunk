import type { ButtonHTMLAttributes, CSSProperties } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, CSSProperties> = {
  primary: { background: 'linear-gradient(180deg, #D7754B, var(--md-color-primary))', color: '#fff', border: 'none' },
  secondary: { background: 'var(--md-color-primary-container)', color: 'var(--md-color-primary)', border: 'none' },
  ghost: { background: 'transparent', color: 'var(--md-color-on-surface)', border: '1px solid var(--md-color-border)' }
};

export function Button({ variant = 'primary', style, ...rest }: Props) {
  return (
    <button
      {...rest}
      style={{
        padding: 'var(--md-space-3) var(--md-space-4)',
        borderRadius: 'var(--md-radius-control)',
        fontSize: 'var(--md-font-size-md)',
        fontWeight: 'var(--md-font-weight-medium)',
        cursor: 'pointer',
        minHeight: 48,
        boxShadow: variant === 'primary' ? '0 8px 18px rgba(200, 100, 63, 0.22)' : undefined,
        ...styles[variant],
        ...style
      }}
    />
  );
}
