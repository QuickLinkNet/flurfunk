export interface AppPageTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function AppPageTitle({ eyebrow, title, subtitle }: AppPageTitleProps) {
  return (
    <div className="app-page-title-block">
      {eyebrow && <p className="app-page-eyebrow">{eyebrow}</p>}
      <h1 className="app-page-title">{title}</h1>
      {subtitle && <p className="app-page-subtitle">{subtitle}</p>}
    </div>
  );
}
