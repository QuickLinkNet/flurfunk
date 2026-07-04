interface Props {
  label: string;
}

export function Chip({ label }: Props) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 12,
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)'
      }}
    >
      {label}
    </span>
  );
}
