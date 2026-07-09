export type IconTint = 'primary' | 'secondary' | 'info' | 'error';

interface Props {
  emoji: string;
  tint?: IconTint;
  size?: number;
}

const TINT_BACKGROUND: Record<IconTint, string> = {
  primary: 'var(--md-color-primary-container)',
  secondary: 'var(--md-color-secondary-container)',
  info: 'var(--md-color-info-container)',
  error: 'var(--md-color-error-container)'
};

// Farbiges Icon-Badge (Kreis-Hintergrund + Emoji), ersetzt reines StatusEmoji
// überall dort, wo Karten pro Kategorie eine Farbe zeigen sollen.
export function IconBadge({ emoji, tint = 'primary', size = 40 }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: TINT_BACKGROUND[tint],
        fontSize: size * 0.5,
        flexShrink: 0
      }}
    >
      {emoji}
    </span>
  );
}
