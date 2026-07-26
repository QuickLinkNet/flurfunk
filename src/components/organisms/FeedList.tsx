import { FeedItemCard } from '../molecules/FeedItemCard';
import type { FeedItem } from '../../types/feedItem';

interface Props {
  items: FeedItem[];
  onChanged: () => void;
  emptyTitle?: string;
  emptyText?: string;
}

export function FeedList({
  items,
  onChanged,
  emptyTitle = 'Keine passenden Meldungen',
  emptyText = 'Sobald es etwas Neues in der Straße gibt, erscheint es hier.'
}: Props) {
  if (items.length === 0) {
    return (
      <div className="feed-empty">
        <strong>{emptyTitle}</strong>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="feed-list">
      {items.map((item) => (
        <FeedItemCard key={item.id} item={item} onChanged={onChanged} />
      ))}
    </div>
  );
}
