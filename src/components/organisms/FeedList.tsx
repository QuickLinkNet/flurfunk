import { FeedItemCard } from '../molecules/FeedItemCard';
import type { FeedItem } from '../../types/feedItem';

interface Props {
  items: FeedItem[];
}

export function FeedList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Noch nichts los in der Straße.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {items.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
