import type { ReactNode } from 'react';

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, action, children, className }: Props) {
  return (
    <section className={`dashboard-card${className ? ` ${className}` : ''}`}>
      <div className="dashboard-card-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
