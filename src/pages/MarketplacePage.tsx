import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { FeedList } from '../components/organisms/FeedList';
import { NewFeedItemForm } from '../components/organisms/NewFeedItemForm';
import { Heading } from '../components/atoms/Heading';
import { fetchFeed } from '../api/feedApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { FeedItem, FeedItemType } from '../types/feedItem';

const MARKET_TYPES: FeedItemType[] = ['marketplace_sell', 'marketplace_give'];

const STATUS_FILTERS = [
  { id: 'open', label: 'Verfügbar' },
  { id: 'all', label: 'Alle' },
  { id: 'done', label: 'Weg' }
] as const;

type StatusFilter = typeof STATUS_FILTERS[number]['id'];

export function MarketplacePage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [status, setStatus] = useState<StatusFilter>('open');

  const reload = useCallback(() => {
    fetchFeed().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => reload(), [reload]);

  const marketItems = useMemo(
    () => items.filter((item) => MARKET_TYPES.includes(item.type)),
    [items]
  );

  const filteredItems = useMemo(
    () => marketItems.filter((item) => status === 'all' || item.status === status),
    [marketItems, status]
  );

  const counts = useMemo(
    () => ({
      all: marketItems.length,
      open: marketItems.filter((item) => item.status === 'open').length
    }),
    [marketItems]
  );

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.marketplace.title} pageSubtitle={PAGE_HEADERS.marketplace.subtitle}>
      <section className="help-board-compose">
        <div>
          <Heading level={2}>Anzeige aufgeben</Heading>
          <p>Verkaufe oder verschenke etwas an deine Nachbarschaft.</p>
        </div>
        <NewFeedItemForm onCreated={reload} initialType="marketplace_give" allowedTypes={MARKET_TYPES} />
      </section>

      <section>
        <div className="help-board-header">
          <div>
            <Heading level={2}>Kleinanzeigen</Heading>
            <div className="help-board-summary" aria-label="Übersicht">
              <span><strong>{counts.open}</strong> verfügbar</span>
              <span><strong>{counts.all}</strong> gesamt</span>
            </div>
          </div>

          <div className="help-board-controls">
            <div className="help-board-filterbar" aria-label="Status filtern">
              {STATUS_FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  data-active={status === entry.id}
                  onClick={() => setStatus(entry.id)}
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
          emptyTitle="Keine Anzeigen in diesem Filter"
          emptyText="Wechsle den Filter oder gib direkt die erste Anzeige auf."
        />
      </section>
    </DashboardTemplate>
  );
}
