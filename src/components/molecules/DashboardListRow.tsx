import { Link } from 'react-router-dom';
import { EmojiBadge } from '../atoms/EmojiBadge';
import { StatusPill } from '../atoms/StatusPill';

export type DashboardRowIcon = 'empty' | 'update' | 'child' | 'event' | 'vacation' | 'trash' | 'calendar';

const ICONS: Record<DashboardRowIcon, string> = {
  empty: '💬',
  update: '💬',
  child: '🙂',
  event: '🔥',
  vacation: '🏖️',
  trash: '🗑️',
  calendar: '📅'
};

interface Props {
  icon: DashboardRowIcon;
  title: string;
  meta?: string;
  badge?: string;
  to?: string;
}

function RowContent({ icon, title, meta, badge }: Omit<Props, 'to'>) {
  return (
    <>
      <EmojiBadge className="dashboard-row-icon" emoji={ICONS[icon]} size={38} />
      <div className="dashboard-row-copy">
        <strong>{title}</strong>
        {meta && <span>{meta}</span>}
      </div>
      {badge && <StatusPill label={badge} />}
    </>
  );
}

export function DashboardListRow({ icon, title, meta, badge, to }: Props) {
  const className = `dashboard-row${to ? ' dashboard-row-link' : ''}`;
  if (to) {
    return (
      <Link to={to} className={className}>
        <RowContent icon={icon} title={title} meta={meta} badge={badge} />
      </Link>
    );
  }

  return (
    <div className={className}>
      <RowContent icon={icon} title={title} meta={meta} badge={badge} />
    </div>
  );
}
