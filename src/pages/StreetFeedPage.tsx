import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { FeedList } from '../components/organisms/FeedList';
import { NewFeedItemForm } from '../components/organisms/NewFeedItemForm';
import { ActionDialog } from '../components/molecules/ActionDialog';
import { fetchFeed } from '../api/feedApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { FEED_CATEGORY_META, FEED_CATEGORY_OPTIONS } from '../utils/feedTypeMeta';
import type { FeedItem } from '../types/feedItem';
import type { FeedCategory } from '../utils/feedTypeMeta';

export function StreetFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [category, setCategory] = useState<FeedCategory>('all');
  const [showDone, setShowDone] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const reload = useCallback(() => {
    fetchFeed().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => reload(), [reload]);

  const filteredItems = useMemo(
    () => items.filter((item) => {
      const categoryMatches = category === 'all' || FEED_CATEGORY_META[category].types.includes(item.type);
      const statusMatches = showDone || item.status !== 'done';
      return categoryMatches && statusMatches;
    }),
    [category, items, showDone]
  );

  const counts = useMemo(
    () => ({
      total: items.length,
      open: items.filter((item) => item.status === 'open').length
    }),
    [items]
  );

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.street.title} pageSubtitle={PAGE_HEADERS.street.subtitle}>
      <section>
        <div className="feed-toolbar">
          <div className="feed-filter-panel">
            <div className="feed-filter-summary">
              <span><strong>{counts.total}</strong> Meldungen</span>
              <span><strong>{counts.open}</strong> offen</span>
              <label className="feed-done-toggle">
                <input type="checkbox" checked={showDone} onChange={(event) => setShowDone(event.target.checked)} />
                Erledigte anzeigen
              </label>
            </div>
            <div className="feed-category-tabs" role="tablist" aria-label="Feed-Kategorien">
              {FEED_CATEGORY_OPTIONS.map(([value, meta]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={category === value}
                  data-active={category === value}
                  onClick={() => setCategory(value)}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="feed-create-button" onClick={() => setIsCreating(true)}>
            + Meldung
          </button>
        </div>

        <FeedList
          items={filteredItems}
          onChanged={reload}
          emptyTitle="Keine Meldungen in diesem Filter"
          emptyText="Passe die Kategorie an oder erstelle eine neue Meldung."
        />
      </section>

      <ActionDialog open={isCreating} title="Neue Kurzmeldung" onClose={() => setIsCreating(false)}>
        <NewFeedItemForm
          onCreated={() => {
            setIsCreating(false);
            reload();
          }}
        />
      </ActionDialog>
    </DashboardTemplate>
  );
}
