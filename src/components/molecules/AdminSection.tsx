import type { ReactNode } from 'react';
import { Heading } from '../atoms/Heading';

interface Props {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  description?: string;
}

export function AdminSection({ title, children, actions, description }: Props) {
  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Heading level={2}>{title}</Heading>
          {description && (
            <p className="admin-section-description">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="admin-section-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
