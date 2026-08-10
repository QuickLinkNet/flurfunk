import type { CSSProperties } from 'react';

type IconName =
  | 'users' | 'calendar' | 'bell' | 'shield' | 'mail' | 'lock'
  | 'ticket' | 'eye' | 'home' | 'street' | 'settings' | 'briefcase' | 'trash' | 'help' | 'feedback' | 'chat';

interface Props {
  name: IconName;
  label?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const PATHS: Record<IconName, string[]> = {
  users: ['M16 29c4 0 7-3 7-7s-3-7-7-7-7 3-7 7 3 7 7 7Z', 'M4 48c2-8 7-13 12-13s10 5 12 13', 'M42 29c4 0 7-3 7-7s-3-7-7-7', 'M34 37c5 1 9 5 11 11'],
  calendar: ['M13 14h30c4 0 7 3 7 7v26H6V21c0-4 3-7 7-7Z', 'M6 27h44', 'M18 8v10M38 8v10', 'M17 36h5M29 36h5M41 36h5'],
  bell: ['M28 50c4 0 7-3 7-7H21c0 4 3 7 7 7Z', 'M12 41h32l-4-5V25c0-7-5-12-12-12S16 18 16 25v11l-4 5Z'],
  shield: ['M28 51s18-8 18-25V14L28 8 10 14v12c0 17 18 25 18 25Z', 'M22 29l4 4 9-10'],
  mail: ['M8 16h40v28H8V16Z', 'M10 18l18 15 18-15'],
  lock: ['M14 25h28v23H14V25Z', 'M21 25v-6c0-5 3-9 7-9s7 4 7 9v6'],
  ticket: ['M9 18h38v9a5 5 0 0 0 0 10v9H9v-9a5 5 0 0 0 0-10v-9Z', 'M28 18v28'],
  eye: ['M7 28s8-12 21-12 21 12 21 12-8 12-21 12S7 28 7 28Z', 'M28 34a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z'],
  home: ['M9 27 28 11l19 16', 'M15 25v22h26V25', 'M24 47V34h8v13'],
  street: ['M14 11h28v34H14V11Z', 'M22 19h4M30 19h4M22 28h4M30 28h4M22 37h4M30 37h4', 'M8 47h40'],
  settings: ['M28 36a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M28 8v7M28 41v7M8 28h7M41 28h7M14 14l5 5M37 37l5 5M42 14l-5 5M19 37l-5 5'],
  briefcase: ['M12 21h32v23H12V21Z', 'M22 21v-5h12v5', 'M12 31h32'],
  trash: ['M17 18h22', 'M22 18v-5h12v5', 'M20 24l2 22h12l2-22', 'M26 29v11M32 29v11'],
  help: ['M17 28c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7Z', 'M7 48c2-8 6-13 10-13s8 5 10 13', 'M35 18c3-4 10-3 10 3 0 6-10 10-10 17', 'M35 46h1'],
  feedback: ['M12 10h32c3 0 5 2 5 5v16c0 3-2 5-5 5H23l-9 9v-9h-2c-3 0-5-2-5-5V15c0-3 2-5 5-5Z', 'M28 18v9', 'M28 32v0.6'],
  chat: ['M10 12h36c3 0 5 2 5 5v18c0 3-2 5-5 5H21l-9 8v-8h-2c-3 0-5-2-5-5V17c0-3 2-5 5-5Z', 'M16 24h24', 'M16 32h16']
};

export function FeatureIcon({ name, label, size = 52, className, style }: Props) {
  return (
    <span
      aria-label={label}
      title={label}
      className={className}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'var(--md-color-secondary-container, #eee6d9)',
        color: 'var(--md-color-brand-green, #24442f)',
        flexShrink: 0,
        ...style
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 56 56" fill="none" aria-hidden="true">
        {PATHS[name].map((path) => (
          <path key={path} d={path} stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </span>
  );
}
