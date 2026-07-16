import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { EventList } from '../components/organisms/EventList';
import { NewEventForm } from '../components/organisms/NewEventForm';
import { Heading } from '../components/atoms/Heading';
import { fetchEvents } from '../api/eventsApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { StreetEvent } from '../types/event';

export function EventsPage() {
  const [events, setEvents] = useState<StreetEvent[]>([]);

  const reload = useCallback(() => {
    fetchEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  useEffect(() => reload(), [reload]);

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.events.title} pageSubtitle={PAGE_HEADERS.events.subtitle}>
      <section>
        <Heading level={2}>Neues Event</Heading>
        <NewEventForm onCreated={reload} />
      </section>
      <section>
        <Heading level={2}>Geplant</Heading>
        <EventList events={events} />
      </section>
    </DashboardTemplate>
  );
}
