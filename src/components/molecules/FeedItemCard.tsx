import { StatusEmoji } from '../atoms/StatusEmoji';
import { FEED_TYPE_META } from '../../utils/feedTypeMeta';
import type { FeedItem } from '../../types/feedItem';

interface Props {
  item: FeedItem;
}

export function FeedItemCard({ item }: Props) {
  const meta = FEED_TYPE_META[item.type];
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 'var(--md-radius-card)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)'
      }}
    >
      <StatusEmoji emoji={meta.emoji} size={24} />
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
          {item.householdName} · {meta.label}
        </p>
        {item.message && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
            {item.message}
          </p>
        )}
      </div>
    </div>
  );
}
