import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  aside?: ReactNode;
}

export function AppPageHero({ children, aside }: Props) {
  return (
    <header className="app-page-hero">
      <div>{children}</div>
      {aside && <div className="app-page-hero-aside">{aside}</div>}
    </header>
  );
}
