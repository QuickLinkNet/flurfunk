import { householdAvatar } from '../../utils/householdAvatar';

interface Props {
  avatarKey?: string | null;
  fallback: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .replace(/^Familie\s+/i, '')
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function HouseholdAvatar({ avatarKey, fallback, size = 56, className }: Props) {
  const avatar = householdAvatar(avatarKey);

  return (
    <span
      className={className}
      title={avatar.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatar.background,
        color: 'var(--md-color-brand-green)',
        fontSize: size * 0.44,
        fontWeight: 'var(--md-font-weight-bold)',
        flexShrink: 0
      }}
    >
      {avatar.emoji || initials(fallback)}
    </span>
  );
}
