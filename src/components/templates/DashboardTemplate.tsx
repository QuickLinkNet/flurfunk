import type { ReactNode } from 'react';
import { BottomNavigation } from '../organisms/BottomNavigation';

interface Props {
  header: ReactNode;
  children: ReactNode;
}

// Layout-Gerüst für die Dashboard-Seite: Header + Inhalt + Bottom-Nav.
export function DashboardTemplate({ header, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 'var(--md-space-4)' }}>{header}</header>
      <main
        style={{
          flex: 1,
          padding: '0 var(--md-space-4) var(--md-space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--md-space-4)'
        }}
      >
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
