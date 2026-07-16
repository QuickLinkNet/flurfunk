import type { ReactNode } from 'react';
import { AppPageHeader } from '../organisms/AppPageHeader';
import { AppSidebar } from '../organisms/AppSidebar';
import { BottomNavigation } from '../organisms/BottomNavigation';

interface Props {
  header?: ReactNode;
  children: ReactNode;
  headerAside?: ReactNode;
  headerVariant?: 'hero' | 'plain';
  pageEyebrow?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  shellClassName?: string;
  contentClassName?: string;
}

export function DashboardTemplate({
  header,
  children,
  headerAside,
  headerVariant = 'hero',
  pageEyebrow,
  pageTitle,
  pageSubtitle,
  shellClassName,
  contentClassName
}: Props) {
  const contentClasses = [
    'app-content',
    headerVariant === 'hero' ? 'app-content-with-hero' : '',
    contentClassName ?? ''
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClassName ? `dashboard-shell ${shellClassName}` : 'dashboard-shell'}>
      <AppSidebar />
      <div className={contentClasses}>
        {headerVariant === 'hero'
          ? <AppPageHeader aside={headerAside} eyebrow={pageEyebrow} title={pageTitle} subtitle={pageSubtitle}>{header}</AppPageHeader>
          : <header className="app-page-header">{header}</header>}
        <main className="app-page-main">{children}</main>
        <BottomNavigation />
      </div>
    </div>
  );
}
