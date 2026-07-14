import { AdminDeleteButton } from '../molecules/AdminDeleteButton';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { AdminListStack } from '../molecules/AdminListStack';
import { CardRow } from '../molecules/CardRow';
import type { AdminFeedItem } from '../../types/admin';

interface Props {
  items: AdminFeedItem[];
  onDelete: (item: AdminFeedItem) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value.replace(' ', 'T')));
}

export function AdminFeedList({ items, onDelete }: Props) {
  if (items.length === 0) {
    return <AdminEmptyState>Keine Feed-Einträge vorhanden.</AdminEmptyState>;
  }

  return (
    <AdminListStack>
      {items.map((item) => (
        <CardRow key={item.id} action={<AdminDeleteButton onClick={() => onDelete(item)} />}>
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {item.householdName} · {item.type}
          </p>
          {item.message && (
            <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
              {item.message}
            </p>
          )}
          <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-xs)', color: 'var(--md-color-on-surface-variant)' }}>
            {item.visibility} · {formatDate(item.createdAt)}
            {item.expiresAt ? ` · bis ${formatDate(item.expiresAt)}` : ''}
          </p>
        </CardRow>
      ))}
    </AdminListStack>
  );
}
