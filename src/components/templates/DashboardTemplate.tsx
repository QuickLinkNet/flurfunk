import type { ReactNode } from 'react';
import { AppSidebar } from '../organisms/AppSidebar';
import { BottomNavigation } from '../organisms/BottomNavigation';

interface Props {
  header: ReactNode;
  children: ReactNode;
  shellClassName?: string;
  contentClassName?: string;
}

export function DashboardTemplate({ header, children, shellClassName, contentClassName }: Props) {
  return (
    <div className={shellClassName ? `dashboard-shell ${shellClassName}` : 'dashboard-shell'}>
      <AppSidebar />
      <div className={contentClassName ? `app-content ${contentClassName}` : 'app-content'}>
        <header className="app-page-header">{header}</header>
        <main className="app-page-main">{children}</main>
        <BottomNavigation />
      </div>
    </div>
  );
}
