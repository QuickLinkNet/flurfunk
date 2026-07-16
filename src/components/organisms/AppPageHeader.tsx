import type { ReactNode } from 'react';
import { AppPageHero } from '../molecules/AppPageHero';
import { AppPageTitle, type AppPageTitleProps } from '../molecules/AppPageTitle';

interface Props extends Partial<AppPageTitleProps> {
  aside?: ReactNode;
  children?: ReactNode;
}

export function AppPageHeader({ aside, children, eyebrow, title, subtitle }: Props) {
  return (
    <AppPageHero aside={aside}>
      {children ?? (title ? <AppPageTitle eyebrow={eyebrow} title={title} subtitle={subtitle} /> : null)}
    </AppPageHero>
  );
}
