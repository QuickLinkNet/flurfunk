import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { AdminHouseholdList } from '../components/organisms/AdminHouseholdList';
import { AdminUserList } from '../components/organisms/AdminUserList';
import { AdminFeedList } from '../components/organisms/AdminFeedList';
import { AdminEventList } from '../components/organisms/AdminEventList';
import { AdminCalendarList } from '../components/organisms/AdminCalendarList';
import { AdminFeatureFlagsForm } from '../components/organisms/AdminFeatureFlagsForm';
import { AdminCreateHouseholdForm } from '../components/organisms/AdminCreateHouseholdForm';
import { Heading } from '../components/atoms/Heading';
import {
  fetchAdminHouseholds,
  deleteAdminHousehold,
  fetchAdminUsers,
  updateAdminUserRole,
  fetchAdminFeed,
  deleteAdminFeedItem,
  fetchAdminEvents,
  deleteAdminEvent,
  fetchAdminCalendar,
  deleteAdminCalendarEntry
} from '../api/adminApi';
import type { AdminCalendarEntry, AdminEvent, AdminFeedItem, AdminHousehold, AdminUser } from '../types/admin';
import type { UserRole } from '../types/user';

export function AdminPage() {
  const [households, setHouseholds] = useState<AdminHousehold[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [feed, setFeed] = useState<AdminFeedItem[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [calendar, setCalendar] = useState<AdminCalendarEntry[]>([]);

  const reload = useCallback(() => {
    fetchAdminHouseholds().then(setHouseholds).catch(() => setHouseholds([]));
    fetchAdminUsers().then(setUsers).catch(() => setUsers([]));
    fetchAdminFeed().then(setFeed).catch(() => setFeed([]));
    fetchAdminEvents().then(setEvents).catch(() => setEvents([]));
    fetchAdminCalendar().then(setCalendar).catch(() => setCalendar([]));
  }, []);

  useEffect(() => reload(), [reload]);

  async function handleDeleteHousehold(id: number) {
    await deleteAdminHousehold(id);
    reload();
  }

  async function handleRoleChange(id: number, role: UserRole) {
    await updateAdminUserRole(id, role);
    reload();
  }

  async function handleDeleteFeedItem(id: number) {
    await deleteAdminFeedItem(id);
    reload();
  }

  async function handleDeleteEvent(id: number) {
    await deleteAdminEvent(id);
    reload();
  }

  async function handleDeleteCalendarEntry(id: number) {
    await deleteAdminCalendarEntry(id);
    reload();
  }

  return (
    <DashboardTemplate header={<Heading level={1}>Verwaltung</Heading>}>
      <section>
        <Heading level={2}>Features</Heading>
        <AdminFeatureFlagsForm />
      </section>
      <section>
        <Heading level={2}>Neuer Haushalt</Heading>
        <AdminCreateHouseholdForm onCreated={reload} />
      </section>
      <section>
        <Heading level={2}>Haushalte ({households.length})</Heading>
        <AdminHouseholdList households={households} onDelete={handleDeleteHousehold} onInvitesChanged={reload} />
      </section>
      <section>
        <Heading level={2}>Nutzer ({users.length})</Heading>
        <AdminUserList users={users} onRoleChange={handleRoleChange} />
      </section>
      <section>
        <Heading level={2}>Straßen-Feed ({feed.length})</Heading>
        <AdminFeedList items={feed} onDelete={handleDeleteFeedItem} />
      </section>
      <section>
        <Heading level={2}>Events ({events.length})</Heading>
        <AdminEventList events={events} onDelete={handleDeleteEvent} />
      </section>
      <section>
        <Heading level={2}>Kalender ({calendar.length})</Heading>
        <AdminCalendarList entries={calendar} onDelete={handleDeleteCalendarEntry} />
      </section>
    </DashboardTemplate>
  );
}
