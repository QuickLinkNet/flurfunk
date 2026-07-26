import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { FeedList } from '../components/organisms/FeedList';
import { NewFeedItemForm } from '../components/organisms/NewFeedItemForm';
import { Heading } from '../components/atoms/Heading';
import { Select } from '../components/atoms/Select';
import { fetchFeed } from '../api/feedApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { FEED_CATEGORY_META, FEED_CATEGORY_OPTIONS, FEED_TYPE_OPTIONS } from '../utils/feedTypeMeta';
import type { FeedItem, FeedItemType } from '../types/feedItem';
import type { FeedCategory } from '../utils/feedTypeMeta';

type FilterValue = 'all' | FeedItemType;
type StatusFilter = 'all' | 'open' | 'done';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'open', label: 'Offen' },
  { id: 'done', label: 'Erledigt' }
];

export function StreetFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [category, setCategory] = useState<FeedCategory>('all');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const reload = useCallback(() => {
    fetchFeed().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => reload(), [reload]);

  const typeOptions = useMemo(
    () => FEED_TYPE_OPTIONS.filter(([value]) => category === 'all' || FEED_CATEGORY_META[category].types.includes(value)),
    [category]
  );

  const filteredItems = useMemo(
    () => items.filter((item) => {
      const categoryMatches = category === 'all' || FEED_CATEGORY_META[category].types.includes(item.type);
      const typeMatches = filter === 'all' || item.type === filter;
      const statusMatches = statusFilter === 'all' || item.status === statusFilter;
      return categoryMatches && typeMatches && statusMatches;
    }),
    [category, filter, items, statusFilter]
  );

  const counts = useMemo(
    () => ({
      total: items.length,
      open: items.filter((item) => item.status === 'open').length,
      comments: items.reduce((sum, item) => sum + item.comments.length, 0),
      reactions: items.reduce((sum, item) => sum + item.reactionCount, 0)
    }),
    [items]
  );

  function handleCategoryChange(nextCategory: FeedCategory) {
    setCategory(nextCategory);
    setFilter('all');
  }

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.street.title} pageSubtitle={PAGE_HEADERS.street.subtitle}>
      <section>
        <Heading level={2}>Kurzmeldung</Heading>
        <NewFeedItemForm onCreated={reload} />
      </section>
      <section>
        <div className="md-card-header" style={{ marginBottom: 'var(--md-space-3)' }}>
          <div>
            <Heading level={2}>Aktuelles</Heading>
            <div className="feed-summary" aria-label="Feed-Übersicht">
              <span><strong>{counts.total}</strong> Meldungen</span>
              <span><strong>{counts.open}</strong> offen</span>
              <span><strong>{counts.comments}</strong> Antworten</span>
              <span><strong>{counts.reactions}</strong> Reaktionen</span>
            </div>
          </div>
          <div className="feed-category-tabs" role="tablist" aria-label="Feed-Kategorien">
            {FEED_CATEGORY_OPTIONS.map(([value, meta]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={category === value}
                data-active={category === value}
                onClick={() => handleCategoryChange(value)}
              >
                {meta.label}
              </button>
            ))}
          </div>
          <div className="feed-filter-row">
            <Select value={filter} onChange={(event) => setFilter(event.target.value as FilterValue)} style={{ maxWidth: 260 }}>
              <option value="all">Alle Meldungen</option>
              {typeOptions.map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.emoji} {meta.label}
                </option>
              ))}
            </Select>
            <div className="feed-status-filter" aria-label="Status filtern">
              {STATUS_FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  data-active={statusFilter === entry.id}
                  onClick={() => setStatusFilter(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <FeedList
          items={filteredItems}
          onChanged={reload}
          emptyTitle="Keine Meldungen in diesem Filter"
          emptyText="Passe Kategorie, Typ oder Status an, um weitere Meldungen zu sehen."
        />
      </section>
    </DashboardTemplate>
  );
}
