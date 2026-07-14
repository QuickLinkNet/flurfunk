import { Link } from 'react-router-dom';

interface Props {
  title: string;
  startsAt: string;
  meta?: string;
  to: string;
}

const DAY = new Intl.DateTimeFormat('de-DE', { day: '2-digit' });
const WEEKDAY = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
const MONTH = new Intl.DateTimeFormat('de-DE', { month: 'short' });

export function DateMiniCard({ title, startsAt, meta, to }: Props) {
  const date = new Date(startsAt);

  return (
    <Link to={to} className="dashboard-date-card">
      <span className="dashboard-date-badge">
        <span>{WEEKDAY.format(date)}</span>
        {DAY.format(date)}
        <span>{MONTH.format(date)}</span>
      </span>
      <span className="dashboard-date-copy">
        <strong>{title}</strong>
        {meta && <span>{meta}</span>}
      </span>
    </Link>
  );
}
