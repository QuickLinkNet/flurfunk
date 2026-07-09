import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  action?: ReactNode;
}

// Gemeinsames Karten-Layout für Listenzeilen im ganzen Frontend (Admin-Listen,
// Kinder, Haustiere, Kalender, RSVP-Antworten) - Inhalt links, Aktion rechts.
export function CardRow({ children, action }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--md-space-3)',
        padding: 'var(--md-space-3) var(--md-space-4)',
        borderRadius: 'var(--md-radius-control)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)',
        boxShadow: 'var(--md-shadow-card)'
      }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      {action}
    </div>
  );
}
