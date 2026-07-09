import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { AdminHouseholdList } from '../components/organisms/AdminHouseholdList';
import { AdminUserList } from '../components/organisms/AdminUserList';
import { AdminFeedList } from '../components/organisms/AdminFeedList';
import { AdminEventList } from '../components/organisms/AdminEventList';
import { AdminCalendarList } from '../components/organisms/AdminCalendarList';
import { AdminFeatureFlagsForm } from '../components/organisms/AdminFeatureFlagsForm';
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
    <DashboardTemplate header={<h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Verwaltung</h1>}>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Features</h2>
        <AdminFeatureFlagsForm />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Haushalte ({households.length})</h2>
        <AdminHouseholdList households={households} onDelete={handleDeleteHousehold} />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Nutzer ({users.length})</h2>
        <AdminUserList users={users} onRoleChange={handleRoleChange} />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Straßen-Feed ({feed.length})</h2>
        <AdminFeedList items={feed} onDelete={handleDeleteFeedItem} />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Events ({events.length})</h2>
        <AdminEventList events={events} onDelete={handleDeleteEvent} />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Kalender ({calendar.length})</h2>
        <AdminCalendarList entries={calendar} onDelete={handleDeleteCalendarEntry} />
      </section>
    </DashboardTemplate>
  );
}
