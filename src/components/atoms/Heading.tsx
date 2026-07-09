import type { ReactNode } from 'react';

interface Props {
  level: 1 | 2;
  children: ReactNode;
}

const SIZE_BY_LEVEL: Record<1 | 2, string> = {
  1: 'var(--md-font-size-xl)',
  2: 'var(--md-font-size-md)'
};

export function Heading({ level, children }: Props) {
  const Tag = level === 1 ? 'h1' : 'h2';
  return (
    <Tag style={{ margin: 0, fontSize: SIZE_BY_LEVEL[level], fontWeight: 'var(--md-font-weight-medium)' }}>
      {children}
    </Tag>
  );
}
