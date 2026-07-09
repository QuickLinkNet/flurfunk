import { Button } from '../atoms/Button';
import { CardRow } from '../molecules/CardRow';
import type { AdminFeedItem } from '../../types/admin';

interface Props {
  items: AdminFeedItem[];
  onDelete: (id: number) => void;
}

export function AdminFeedList({ items, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Keine Feed-Einträge vorhanden.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {items.map((item) => (
        <CardRow
          key={item.id}
          action={
            <Button variant="ghost" onClick={() => onDelete(item.id)}>
              Löschen
            </Button>
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {item.householdName} · {item.type}
          </p>
          {item.message && (
            <p
              style={{
                margin: 'var(--md-space-1) 0 0',
                fontSize: 'var(--md-font-size-sm)',
                color: 'var(--md-color-on-surface-variant)'
              }}
            >
              {item.message}
            </p>
          )}
        </CardRow>
      ))}
    </div>
  );
}
