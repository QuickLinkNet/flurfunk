import { AdminDeleteButton } from '../molecules/AdminDeleteButton';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { AdminListStack } from '../molecules/AdminListStack';
import { CardRow } from '../molecules/CardRow';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminCalendarEntry } from '../../types/admin';

interface Props {
  entries: AdminCalendarEntry[];
  onDelete: (entry: AdminCalendarEntry) => void;
}

export function AdminCalendarList({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return <AdminEmptyState>Keine Kalendereinträge vorhanden.</AdminEmptyState>;
  }

  return (
    <AdminListStack>
      {entries.map((entry) => (
        <CardRow key={entry.id} action={<AdminDeleteButton onClick={() => onDelete(entry)} />}>
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {entry.title}
          </p>
          <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
            {entry.type} · {formatDateTimeLabel(entry.startsAt)}
          </p>
        </CardRow>
      ))}
    </AdminListStack>
  );
}
