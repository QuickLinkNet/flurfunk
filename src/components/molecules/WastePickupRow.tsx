import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { EmojiBadge } from '../atoms/EmojiBadge';
import { wasteMeta } from '../../utils/wasteTypeMeta';

interface Props {
  title: string;
  startsAt: string;
}

const DATE = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });

function relativeDay(value: string): string {
  const target = new Date(value);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Morgen';
  return DATE.format(new Date(value));
}

export function WastePickupRow({ title, startsAt }: Props) {
  const meta = wasteMeta(title);

  return (
    <Link to="/kalender" className="dashboard-waste-row" style={{ '--waste-color': meta.color } as CSSProperties}>
      <EmojiBadge className="dashboard-waste-icon" emoji={meta.icon} size={38} />
      <span>
        <strong>{meta.label}</strong>
        <small>{relativeDay(startsAt)}</small>
      </span>
      <span className="dashboard-waste-check" aria-label="Geplant" />
    </Link>
  );
}
