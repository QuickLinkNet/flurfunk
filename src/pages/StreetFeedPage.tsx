import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { FeedList } from '../components/organisms/FeedList';
import { NewFeedItemForm } from '../components/organisms/NewFeedItemForm';
import { Heading } from '../components/atoms/Heading';
import { Select } from '../components/atoms/Select';
import { fetchFeed } from '../api/feedApi';
import { FEED_TYPE_OPTIONS } from '../utils/feedTypeMeta';
import type { FeedItem, FeedItemType } from '../types/feedItem';

type FilterValue = 'all' | FeedItemType;

export function StreetFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');

  const reload = useCallback(() => {
    fetchFeed().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => reload(), [reload]);

  const filteredItems = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.type === filter)),
    [filter, items]
  );

  return (
    <DashboardTemplate header={<Heading level={1}>Straße</Heading>}>
      <section>
        <Heading level={2}>Kurzmeldung</Heading>
        <NewFeedItemForm onCreated={reload} />
      </section>
      <section>
        <div className="md-card-header" style={{ marginBottom: 'var(--md-space-3)' }}>
          <Heading level={2}>Aktuelles</Heading>
          <Select value={filter} onChange={(event) => setFilter(event.target.value as FilterValue)} style={{ maxWidth: 260 }}>
            <option value="all">Alle Meldungen</option>
            {FEED_TYPE_OPTIONS.map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.emoji} {meta.label}
              </option>
            ))}
          </Select>
        </div>
        <FeedList items={filteredItems} />
      </section>
    </DashboardTemplate>
  );
}
