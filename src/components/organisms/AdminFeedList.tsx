import { Button } from '../atoms/Button';
import type { AdminFeedItem } from '../../types/admin';

interface Props {
  items: AdminFeedItem[];
  onDelete: (id: number) => void;
}

export function AdminFeedList({ items, onDelete }: Props) {
  if (items.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Keine Feed-Einträge vorhanden.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 'var(--md-radius-control)',
            background: 'var(--md-color-surface)',
            border: '1px solid var(--md-color-border)'
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
              {item.householdName} · {item.type}
            </p>
            {item.message && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>{item.message}</p>
            )}
          </div>
          <Button variant="ghost" onClick={() => onDelete(item.id)}>
            Löschen
          </Button>
        </div>
      ))}
    </div>
  );
}
