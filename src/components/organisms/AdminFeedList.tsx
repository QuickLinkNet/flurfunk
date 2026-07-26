import { StatusPill } from '../atoms/StatusPill';
import { AdminContentCard } from '../molecules/AdminContentCard';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { FEED_TYPE_META } from '../../utils/feedTypeMeta';
import { formatDateTimeLabel } from '../../utils/date';
import { visibilityLabel, type Visibility } from '../../utils/visibility';
import type { AdminFeedItem } from '../../types/admin';
import type { FeedItemType } from '../../types/feedItem';

interface Props {
  items: AdminFeedItem[];
  onDelete: (item: AdminFeedItem) => void;
}

function normalizeDate(value: string): string {
  return value.replace(' ', 'T');
}

function feedTypeLabel(type: string): string {
  if (type in FEED_TYPE_META) {
    return FEED_TYPE_META[type as FeedItemType].label;
  }

  return type;
}

function adminVisibilityLabel(value: string): string {
  if (value === 'public' || value === 'neighbors' || value === 'private') {
    return visibilityLabel(value as Visibility);
  }

  return value;
}

export function AdminFeedList({ items, onDelete }: Props) {
  if (items.length === 0) {
    return <AdminEmptyState>Keine Feed-Einträge vorhanden.</AdminEmptyState>;
  }

  return (
    <div className="admin-content-list">
      {items.map((item) => (
        <AdminContentCard
          key={item.id}
          title={item.householdName}
          onDelete={() => onDelete(item)}
          meta={
            <>
              <StatusPill label={feedTypeLabel(item.type)} />
              <StatusPill label={item.status === 'done' ? 'Erledigt' : 'Offen'} tone={item.status === 'done' ? 'success' : 'neutral'} />
              <StatusPill label={adminVisibilityLabel(item.visibility)} />
            </>
          }
        >
          {item.message && <p>{item.message}</p>}
          <p>
            Erstellt: {formatDateTimeLabel(normalizeDate(item.createdAt))}
            {item.expiresAt ? ` · sichtbar bis ${formatDateTimeLabel(normalizeDate(item.expiresAt))}` : ''}
          </p>
        </AdminContentCard>
      ))}
    </div>
  );
}
