import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function ActionDialog({ open, title, children, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="action-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="action-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="action-dialog-header">
          <h2 id="action-dialog-title">{title}</h2>
          <button type="button" aria-label="Dialog schließen" onClick={onClose}>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
