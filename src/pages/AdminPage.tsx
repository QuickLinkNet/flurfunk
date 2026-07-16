import { useState } from 'react';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { AdminSearchBar } from '../components/molecules/AdminSearchBar';
import { AdminSection } from '../components/molecules/AdminSection';
import { AdminTabs } from '../components/molecules/AdminTabs';
import { AdminCalendarList } from '../components/organisms/AdminCalendarList';
import { AdminCreateHouseholdForm } from '../components/organisms/AdminCreateHouseholdForm';
import { AdminEventList } from '../components/organisms/AdminEventList';
import { AdminFeatureFlagsForm } from '../components/organisms/AdminFeatureFlagsForm';
import { AdminFeedList } from '../components/organisms/AdminFeedList';
import { AdminHouseholdList } from '../components/organisms/AdminHouseholdList';
import { AdminInviteRollout } from '../components/organisms/AdminInviteRollout';
import { AdminNoticePanel } from '../components/organisms/AdminNoticePanel';
import { AdminOverview } from '../components/organisms/AdminOverview';
import { AdminUserList } from '../components/organisms/AdminUserList';
import { AdminWastePickupForm } from '../components/organisms/AdminWastePickupForm';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import {
  deleteAdminHousehold,
  updateAdminUserRole
} from '../api/adminApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { useAdminData } from '../hooks/useAdminData';
import { useAdminDeleteDialog } from '../hooks/useAdminDeleteDialog';
import { useAdminSearch } from '../hooks/useAdminSearch';
import type { AdminTab } from '../types/admin';
import type { UserRole } from '../types/user';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { calendar, events, feed, households, notices, reload, users } = useAdminData();
  const { filteredHouseholds, filteredUsers, openOnboardingCount, search, setSearch } = useAdminSearch({ households, users });

  const {
    deleteDialogProps,
    requestDeleteCalendarEntry,
    requestDeleteEvent,
    requestDeleteFeedItem,
    requestDeleteNotice
  } = useAdminDeleteDialog({ onDeleted: reload });

  async function handleDeleteHousehold(id: number) {
    await deleteAdminHousehold(id);
    reload();
  }

  async function handleRoleChange(id: number, role: UserRole) {
    await updateAdminUserRole(id, role);
    reload();
  }

  function handleDeleteNotice(id: number) {
    const notice = notices.find((item) => item.id === id);
    if (notice) requestDeleteNotice(notice);
  }

  const openInviteCount = households.reduce(
    (count, household) => count + household.invites.filter((invite) => !invite.usedAt && !invite.revokedAt).length,
    0
  );

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.admin.title} pageSubtitle={PAGE_HEADERS.admin.subtitle}>
      <AdminSearchBar value={search} onChange={setSearch} />
      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <AdminOverview
          householdCount={households.length}
          openInviteCount={openInviteCount}
          userCount={users.length}
          openOnboardingCount={openOnboardingCount}
          feedCount={feed.length}
          eventCount={events.length}
          calendarCount={calendar.length}
          noticeCount={notices.length}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'households' && (
        <>
          <AdminSection title="Neuer Haushalt">
            <AdminCreateHouseholdForm onCreated={reload} />
          </AdminSection>
          <AdminSection title={`Haushalte (${filteredHouseholds.length}/${households.length})`}>
            <AdminHouseholdList households={filteredHouseholds} onDelete={handleDeleteHousehold} onInvitesChanged={reload} onHouseholdChanged={reload} />
          </AdminSection>
        </>
      )}

      {activeTab === 'users' && (
        <AdminSection title={`Nutzer (${filteredUsers.length}/${users.length})`}>
          <AdminUserList users={filteredUsers} onRoleChange={handleRoleChange} onPushTestComplete={reload} />
        </AdminSection>
      )}

      {activeTab === 'invites' && (
        <AdminSection
          title={`Einladungen (${openInviteCount} offen)`}
          description="Rollout-Status pro Haushalt: Codes kopieren, Einladungstext senden und offene Codes widerrufen."
        >
          <AdminInviteRollout households={filteredHouseholds} onChanged={reload} />
        </AdminSection>
      )}

      {activeTab === 'content' && (
        <>
          <AdminSection title={`Dashboard-Hinweise (${notices.length})`}>
            <AdminNoticePanel notices={notices} onCreated={reload} onDelete={handleDeleteNotice} />
          </AdminSection>
          <AdminSection title={`Straßen-Feed (${feed.length})`}>
            <AdminFeedList items={feed} onDelete={requestDeleteFeedItem} />
          </AdminSection>
          <AdminSection title={`Events (${events.length})`}>
            <AdminEventList events={events} onDelete={requestDeleteEvent} />
          </AdminSection>
        </>
      )}

      {activeTab === 'calendar' && (
        <AdminSection title={`Kalender (${calendar.length})`}>
          <AdminWastePickupForm onCreated={reload} />
          <AdminCalendarList entries={calendar} onDelete={requestDeleteCalendarEntry} />
        </AdminSection>
      )}

      {activeTab === 'system' && (
        <AdminSection title="Features">
          <AdminFeatureFlagsForm />
        </AdminSection>
      )}
      <ConfirmDialog {...deleteDialogProps} />
    </DashboardTemplate>
  );
}
