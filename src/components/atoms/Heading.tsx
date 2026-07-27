import type { ReactNode } from 'react';

interface Props {
  level: 1 | 2;
  children: ReactNode;
  className?: string;
}

const SIZE_BY_LEVEL: Record<1 | 2, string> = {
  1: 'var(--md-font-size-xl)',
  2: 'var(--md-font-size-lg)'
};

export function Heading({ level, children, className }: Props) {
  const Tag = level === 1 ? 'h1' : 'h2';
  return (
    <Tag
      className={className}
      style={{
        margin: 0,
        fontSize: `var(--md-heading-font-size, ${SIZE_BY_LEVEL[level]})`,
        fontWeight: 'var(--md-heading-font-weight, var(--md-font-weight-medium))'
      }}
    >
      {children}
    </Tag>
  );
}
