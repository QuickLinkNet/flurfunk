import type { ReactNode } from 'react';
import { AdminDeleteButton } from './AdminDeleteButton';

interface Props {
  title: string;
  meta?: ReactNode;
  children?: ReactNode;
  onDelete?: () => void;
}

export function AdminContentCard({ title, meta, children, onDelete }: Props) {
  return (
    <article className="admin-content-card">
      <div className="admin-content-card-main">
        <div className="admin-content-card-header">
          <h3>{title}</h3>
          {meta && <div className="admin-content-card-meta">{meta}</div>}
        </div>
        {children && <div className="admin-content-card-body">{children}</div>}
      </div>
      {onDelete && (
        <div className="admin-content-card-actions">
          <AdminDeleteButton onClick={onDelete} />
        </div>
      )}
    </article>
  );
}
