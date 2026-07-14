import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AdminListStack({ children }: Props) {
  return (
    <div className="admin-list-stack">
      {children}
    </div>
  );
}
