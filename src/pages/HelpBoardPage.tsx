import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { FeedList } from '../components/organisms/FeedList';
import { NewFeedItemForm } from '../components/organisms/NewFeedItemForm';
import { Heading } from '../components/atoms/Heading';
import { fetchFeed } from '../api/feedApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { FEED_CATEGORY_META, type FeedCategory } from '../utils/feedTypeMeta';
import type { FeedItem, FeedItemType } from '../types/feedItem';

const HELP_TYPES: FeedItemType[] = ['help_needed', 'tool_available', 'babysitter_needed', 'package_received'];
const HELP_CATEGORIES: FeedCategory[] = ['all', 'help', 'sharing', 'packages'];

const STATUS_FILTERS = [
  { id: 'open', label: 'Offen' },
  { id: 'all', label: 'Alle' },
  { id: 'done', label: 'Erledigt' }
] as const;

type StatusFilter = typeof STATUS_FILTERS[number]['id'];

function matchesCategory(item: FeedItem, category: FeedCategory): boolean {
  return FEED_CATEGORY_META[category].types.includes(item.type);
}

function matchesStatus(item: FeedItem, status: StatusFilter): boolean {
  if (status === 'all') return true;
  return item.status === status;
}

export function HelpBoardPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [category, setCategory] = useState<FeedCategory>('all');
  const [status, setStatus] = useState<StatusFilter>('open');

  const reload = useCallback(() => {
    fetchFeed().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => reload(), [reload]);

  const boardItems = useMemo(
    () => items.filter((item) => HELP_TYPES.includes(item.type)),
    [items]
  );

  const helpItems = useMemo(
    () => boardItems.filter((item) => matchesCategory(item, category) && matchesStatus(item, status)),
    [boardItems, category, status]
  );

  const counts = useMemo(
    () => ({
      all: boardItems.length,
      open: boardItems.filter((item) => item.status === 'open').length,
      done: boardItems.filter((item) => item.status === 'done').length
    }),
    [boardItems]
  );

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.help.title} pageSubtitle={PAGE_HEADERS.help.subtitle}>
      <section className="help-board-compose">
        <div>
          <Heading level={2}>Eintrag erstellen</Heading>
          <p>Teile kurz, was du suchst, verleihst oder für Nachbarn erledigen kannst.</p>
        </div>
        <NewFeedItemForm onCreated={reload} initialType="help_needed" allowedTypes={HELP_TYPES} />
      </section>

      <section>
        <div className="help-board-header">
          <div>
            <Heading level={2}>Schwarzes Brett</Heading>
            <div className="help-board-summary" aria-label="Übersicht">
              <span><strong>{counts.open}</strong> offen</span>
              <span><strong>{counts.done}</strong> erledigt</span>
              <span><strong>{counts.all}</strong> gesamt</span>
            </div>
          </div>

          <div className="help-board-controls">
            <div className="help-board-filterbar" aria-label="Kategorie filtern">
              {HELP_CATEGORIES.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  data-active={category === entry}
                  onClick={() => setCategory(entry)}
                >
                  {FEED_CATEGORY_META[entry].label}
                </button>
              ))}
            </div>

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
          items={helpItems}
          onChanged={reload}
          emptyTitle="Keine Aushänge in diesem Filter"
          emptyText="Wechsle Kategorie oder Status, oder erstelle direkt einen neuen Aushang."
        />
      </section>
    </DashboardTemplate>
  );
}
