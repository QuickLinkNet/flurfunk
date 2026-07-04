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
      <header style={{ padding: '16px' }}>{header}</header>
      <main style={{ flex: 1, padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
