import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { FeedList } from '../components/organisms/FeedList';
import { NewFeedItemForm } from '../components/organisms/NewFeedItemForm';
import { Heading } from '../components/atoms/Heading';
import { fetchFeed } from '../api/feedApi';
import type { FeedItem } from '../types/feedItem';

export function StreetFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);

  const reload = useCallback(() => {
    fetchFeed().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => reload(), [reload]);

  return (
    <DashboardTemplate header={<Heading level={1}>Straße</Heading>}>
      <section>
        <Heading level={2}>Neuer Eintrag</Heading>
        <NewFeedItemForm onCreated={reload} />
      </section>
      <section>
        <Heading level={2}>Aktuelles</Heading>
        <FeedList items={items} />
      </section>
    </DashboardTemplate>
  );
}
