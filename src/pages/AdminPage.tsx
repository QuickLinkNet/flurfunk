import { useState } from 'react';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { AdminSearchBar } from '../components/molecules/AdminSearchBar';
import { AdminSection } from '../components/molecules/AdminSection';
import { AdminTabs } from '../components/molecules/AdminTabs';
import { AdminCalendarList } from '../components/organisms/AdminCalendarList';
import { AdminCreateHouseholdForm } from '../components/organisms/AdminCreateHouseholdForm';
import { AdminDigestPanel } from '../components/organisms/AdminDigestPanel';
import { AdminTrashReminderPanel } from '../components/organisms/AdminTrashReminderPanel';
import { AdminEventList } from '../components/organisms/AdminEventList';
import { AdminFeatureFlagsForm } from '../components/organisms/AdminFeatureFlagsForm';
import { AdminFeedList } from '../components/organisms/AdminFeedList';
import { AdminFeedbackList } from '../components/organisms/AdminFeedbackList';
import { AdminHouseholdList } from '../components/organisms/AdminHouseholdList';
import { AdminInviteRollout } from '../components/organisms/AdminInviteRollout';
import { AdminNoticePanel } from '../components/organisms/AdminNoticePanel';
import { AdminOverview } from '../components/organisms/AdminOverview';
import { AdminStreetInvitePanel } from '../components/organisms/AdminStreetInvitePanel';
import { AdminStreetMap } from '../components/organisms/AdminStreetMap';
import { AdminSystemStatusPanel } from '../components/organisms/AdminSystemStatusPanel';
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
  const { calendar, events, feed, feedback, households, notices, reload, users } = useAdminData();
  const { filteredHouseholds, filteredUsers, openOnboardingCount, search, setSearch } = useAdminSearch({ households, users });

  const {
    deleteDialogProps,
    requestDeleteCalendarEntry,
    requestDeleteEvent,
    requestDeleteFeedItem,
    requestDeleteFeedback,
    requestDeleteNotice,
    requestDeleteUser
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
  const openFeedbackCount = feedback.filter((report) => report.status === 'open').length;

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
          openFeedbackCount={openFeedbackCount}
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
          <AdminUserList users={filteredUsers} onRoleChange={handleRoleChange} onDelete={requestDeleteUser} onPushTestComplete={reload} />
        </AdminSection>
      )}

      {activeTab === 'invites' && (
        <>
          <AdminSection
            title="Einladungslink"
            description="Ein Link für alle: Familien legen sich selbst an oder treten einer bestehenden bei."
          >
            <AdminStreetInvitePanel />
          </AdminSection>
          <AdminSection
            title={`Einladungscodes (${openInviteCount} offen)`}
            description="Rollout-Status pro Haushalt: Codes kopieren, Einladungstext senden und offene Codes widerrufen."
          >
            <AdminInviteRollout households={filteredHouseholds} onChanged={reload} />
          </AdminSection>
        </>
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

      {activeTab === 'feedback' && (
        <AdminSection
          title={`Feedback (${feedback.length})`}
          description="Bug-Meldungen und Ideen von Nutzern, direkt aus der App."
        >
          <AdminFeedbackList reports={feedback} onDelete={requestDeleteFeedback} onChanged={reload} />
        </AdminSection>
      )}

      {activeTab === 'calendar' && (
        <AdminSection title={`Kalender (${calendar.length})`}>
          <AdminWastePickupForm onCreated={reload} />
          <AdminCalendarList entries={calendar} onDelete={requestDeleteCalendarEntry} />
        </AdminSection>
      )}

      {activeTab === 'map' && (
        <AdminSection
          title="Straßenkarte"
          description="Schematische Anordnung nach Hausnummer (ungerade links, gerade rechts) — Admin-Ansicht mit Haushaltsmitgliedern. Alle Nachbarn sehen eine eigene Version unter „Karte“ in der Navigation."
        >
          <AdminStreetMap households={households} />
        </AdminSection>
      )}

      {activeTab === 'system' && (
        <>
          <AdminSection
            title="Systemstatus"
            description="Schneller Check für Rollout, Migrationen, PWA, Push und aktivierte Features."
          >
            <AdminSystemStatusPanel />
          </AdminSection>
          <AdminSection
            title="Wöchentlicher Digest"
            description="Vorschau für den Wochenblick. Erst manuell testbar, später per Cron automatisierbar."
          >
            <AdminDigestPanel />
          </AdminSection>
          <AdminSection
            title="Mülltermin-Erinnerung"
            description="Schickt am Vorabend Push + E-Mail an alle, wenn morgen Abholtag ist. Manuell testbar, später per Cron automatisierbar (siehe /cron/trash-reminder)."
          >
            <AdminTrashReminderPanel />
          </AdminSection>
          <AdminSection title="Features">
            <AdminFeatureFlagsForm />
          </AdminSection>
        </>
      )}
      <ConfirmDialog {...deleteDialogProps} />
    </DashboardTemplate>
  );
}
