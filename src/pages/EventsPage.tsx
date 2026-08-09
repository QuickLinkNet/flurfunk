import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { EventList } from '../components/organisms/EventList';
import { EventPollList } from '../components/organisms/EventPollList';
import { NewEventForm } from '../components/organisms/NewEventForm';
import { NewEventPollForm } from '../components/organisms/NewEventPollForm';
import { Button } from '../components/atoms/Button';
import { Heading } from '../components/atoms/Heading';
import { fetchEvents } from '../api/eventsApi';
import { fetchEventPolls } from '../api/eventPollApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { StreetEvent } from '../types/event';
import type { EventPoll } from '../types/eventPoll';

type CreateMode = 'event' | 'poll';

export function EventsPage() {
  const [events, setEvents] = useState<StreetEvent[]>([]);
  const [polls, setPolls] = useState<EventPoll[]>([]);
  const [createMode, setCreateMode] = useState<CreateMode>('event');

  const reload = useCallback(() => {
    fetchEvents().then(setEvents).catch(() => setEvents([]));
    fetchEventPolls().then(setPolls).catch(() => setPolls([]));
  }, []);

  useEffect(() => reload(), [reload]);

  const openPolls = polls.filter((poll) => poll.status === 'open');

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.events.title} pageSubtitle={PAGE_HEADERS.events.subtitle}>
      <section>
        <Heading level={2}>Neues Event</Heading>
        <div style={{ display: 'flex', gap: 'var(--md-space-2)', marginBottom: 'var(--md-space-3)' }}>
          <Button type="button" variant={createMode === 'event' ? 'primary' : 'ghost'} style={{ flex: 1 }} onClick={() => setCreateMode('event')}>
            Termin festlegen
          </Button>
          <Button type="button" variant={createMode === 'poll' ? 'primary' : 'ghost'} style={{ flex: 1 }} onClick={() => setCreateMode('poll')}>
            Mehrere Termine zur Wahl stellen
          </Button>
        </div>
        {createMode === 'event' ? <NewEventForm onCreated={reload} /> : <NewEventPollForm onCreated={reload} />}
      </section>
      {openPolls.length > 0 && (
        <section>
          <Heading level={2}>Offene Terminfindungen</Heading>
          <EventPollList polls={openPolls} />
        </section>
      )}
      <section>
        <Heading level={2}>Geplant</Heading>
        <EventList events={events} />
      </section>
    </DashboardTemplate>
  );
}
