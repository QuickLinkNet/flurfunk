import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { EventList } from '../components/organisms/EventList';
import { NewEventForm } from '../components/organisms/NewEventForm';
import { fetchEvents } from '../api/eventsApi';
import type { StreetEvent } from '../types/event';

export function EventsPage() {
  const [events, setEvents] = useState<StreetEvent[]>([]);

  const reload = useCallback(() => {
    fetchEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  useEffect(() => reload(), [reload]);

  return (
    <DashboardTemplate header={<h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Events</h1>}>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Neues Event</h2>
        <NewEventForm onCreated={reload} />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Geplant</h2>
        <EventList events={events} />
      </section>
    </DashboardTemplate>
  );
}
