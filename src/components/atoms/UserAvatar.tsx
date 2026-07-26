import { householdAvatar } from '../../utils/householdAvatar';

interface Props {
  avatarUrl?: string | null;
  fallback: string;
  size?: number;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.slice(0, 1))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function UserAvatar({ avatarUrl, fallback, size = 42 }: Props) {
  const avatar = avatarUrl ? householdAvatar(avatarUrl) : null;
  return (
    <span
      title={avatar?.label ?? fallback}
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatar?.background ?? 'linear-gradient(135deg, #d7754b, #f4d4ba)',
        color: 'var(--md-color-brand-green)',
        fontSize: avatar ? size * 0.48 : size * 0.36,
        fontWeight: 'var(--md-font-weight-bold)',
        flexShrink: 0
      }}
    >
      {avatar?.emoji ?? initials(fallback)}
    </span>
  );
}
