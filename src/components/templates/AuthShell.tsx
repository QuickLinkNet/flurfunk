import type { ReactNode } from 'react';
import { BrandMark } from '../atoms/BrandMark';

interface Props {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: Props) {
  return (
    <main className="auth-shell">
      <section className="auth-hero" aria-label="Flurfunk Anmeldung">
        <div className="auth-brand">
          <BrandMark />
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="auth-panel">{children}</div>
      </section>
    </main>
  );
}
