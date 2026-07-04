import { FeedItemCard } from '../molecules/FeedItemCard';
import type { FeedItem } from '../../types/feedItem';

interface Props {
  items: FeedItem[];
}

export function FeedList({ items }: Props) {
  if (items.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Noch nichts los in der Straße.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
