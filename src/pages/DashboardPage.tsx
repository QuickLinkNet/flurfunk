import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionDialog } from '../components/molecules/ActionDialog';
import { DashboardCard } from '../components/molecules/DashboardCard';
import { DashboardListRow } from '../components/molecules/DashboardListRow';
import { DateMiniCard } from '../components/molecules/DateMiniCard';
import { PersonStatusStrip } from '../components/molecules/PersonStatusStrip';
import { QuickActionGrid, type QuickActionId } from '../components/molecules/QuickActionGrid';
import { WastePickupRow } from '../components/molecules/WastePickupRow';
import { AppSidebar } from '../components/organisms/AppSidebar';
import { BottomNavigation } from '../components/organisms/BottomNavigation';
import { HouseholdStatusForm } from '../components/organisms/HouseholdStatusForm';
import { NewCalendarEntryForm } from '../components/organisms/NewCalendarEntryForm';
import { NewFeedItemForm } from '../components/organisms/NewFeedItemForm';
import { OnboardingChecklist } from '../components/organisms/OnboardingChecklist';
import { fetchDashboard } from '../api/dashboardApi';
import { useAuth } from '../hooks/useAuth';
import { CHILD_LOCATION_LABELS } from '../types/child';
import type { DashboardData } from '../types/dashboard';

type DialogAction = QuickActionId;
const ONBOARDING_DISMISSED_KEY = 'flurfunk.onboarding.dismissed';

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(new Date(value));
}

function EmptyRow({ title, icon = 'empty' }: { title: string; icon?: 'empty' | 'child' | 'event' | 'vacation' | 'trash' | 'calendar' }) {
  return <DashboardListRow icon={icon} title={title} />;
}

function matchesSearch(query: string, ...values: Array<string | null | undefined>): boolean {
  if (!query) return true;
  return values.some((value) => value?.toLowerCase().includes(query));
}

function actionTitle(action: DialogAction | null): string {
  if (action === 'feed') return 'Kurzmeldung';
  if (action === 'help') return 'Hilfe suchen';
  if (action === 'event') return 'Event planen';
  return 'Status ändern';
}

export function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dialogAction, setDialogAction] = useState<DialogAction | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem(ONBOARDING_DISMISSED_KEY) !== '1');
  const [search, setSearch] = useState('');

  const reloadDashboard = useCallback(() => {
    fetchDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  useEffect(() => {
    reloadDashboard();
  }, [reloadDashboard]);

  const query = search.trim().toLowerCase();
  const householdsStatus = dashboard?.householdsStatus.filter((household) => (
    matchesSearch(query, household.name, household.addressLine, household.statusLabel, household.statusNote)
  )) ?? [];
  const quickUpdates = dashboard?.quickUpdates.filter((item) => matchesSearch(query, item.message, item.type, item.householdName, item.badge)) ?? [];
  const childrenToday = dashboard?.childrenToday.filter((child) => matchesSearch(query, child.name, child.locationNote, CHILD_LOCATION_LABELS[child.currentLocation])) ?? [];
  const upcomingDates = dashboard?.upcomingDates.filter((entry) => matchesSearch(query, entry.title, entry.type)) ?? [];
  const todayEvents = dashboard?.todayEvents.filter((event) => matchesSearch(query, event.title, event.location, event.creatorHouseholdName)) ?? [];
  const vacations = dashboard?.vacations.filter((vacation) => matchesSearch(query, vacation.name)) ?? [];
  const wastePickups = dashboard?.wastePickups.filter((entry) => matchesSearch(query, entry.title)) ?? [];
  const onboardingIncomplete = Boolean(user && !user.onboardingCompletedAt);

  function handleQuickAction(action: QuickActionId) {
    setDialogAction((current) => (current === action ? null : action));
  }

  function handleSaved() {
    setDialogAction(null);
    reloadDashboard();
  }

  function dismissOnboarding() {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1');
    setShowOnboarding(false);
  }

  return (
    <div className="dashboard-shell">
      <AppSidebar />

      <div className="app-content">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">Guten Morgen, {user?.displayName ?? 'Nachbar:in'}!</p>
            <h1 className="dashboard-title">{dashboard?.streetName ?? 'Flurfunk'}</h1>
          </div>
          <div className="dashboard-search-wrap">
            <input
              className="dashboard-search"
              placeholder="Suche..."
              aria-label="Dashboard durchsuchen"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </header>

        <main className="dashboard-layout">
          <div className="dashboard-main">
            <DashboardCard title="Wer ist zuhause?" action={<Link to="/haushalt/mein">Alle anzeigen</Link>}>
              <PersonStatusStrip households={householdsStatus} />
              {dashboard && householdsStatus.length === 0 && <EmptyRow title={query ? 'Keine passenden Haushalte.' : 'Noch keine Haushalte sichtbar.'} />}
            </DashboardCard>

            <DashboardCard title="Schnellaktionen">
              <QuickActionGrid activeAction={dialogAction} onAction={handleQuickAction} />
            </DashboardCard>

            {(onboardingIncomplete || showOnboarding) && (
              <OnboardingChecklist
                required={onboardingIncomplete}
                currentStep={user?.onboardingCurrentStep}
                onStatusClick={() => setDialogAction('status')}
                onDismiss={dismissOnboarding}
              />
            )}

            <div className="dashboard-split-grid">
              <DashboardCard title="Straßen-Updates" action={<Link to="/strasse">Alle anzeigen</Link>}>
                {quickUpdates.map((item) => (
                  <DashboardListRow key={item.id} icon="update" title={item.message ?? item.type} meta={`von ${item.householdName}`} badge={item.badge} to="/strasse" />
                ))}
                {dashboard && quickUpdates.length === 0 && <EmptyRow title={query ? 'Keine passenden Updates.' : 'Noch keine neuen Updates.'} />}
              </DashboardCard>

              <DashboardCard title="Kinder heute" action={<Link to="/haushalt/mein">Bearbeiten</Link>}>
                {childrenToday.map((child) => (
                  <DashboardListRow key={child.id} icon="child" title={child.name} meta={child.locationNote ?? CHILD_LOCATION_LABELS[child.currentLocation]} to="/haushalt/mein" />
                ))}
                {dashboard && childrenToday.length === 0 && <EmptyRow icon="child" title={query ? 'Keine passenden Kinder-Status.' : 'Noch keine Kinder-Status gesetzt.'} />}
              </DashboardCard>
            </div>

            <DashboardCard title="Nächste Termine" action={<Link to="/kalender">Kalender</Link>}>
              {upcomingDates.length > 0 && (
                <div className="dashboard-date-rail">
                  {upcomingDates.map((entry) => (
                    <DateMiniCard key={entry.id} title={entry.title} startsAt={entry.startsAt} meta={formatTime(entry.startsAt)} to="/kalender" />
                  ))}
                </div>
              )}
              {dashboard && upcomingDates.length === 0 && <EmptyRow icon="calendar" title={query ? 'Keine passenden Termine.' : 'Keine kommenden Termine.'} />}
            </DashboardCard>
          </div>

          <aside className="dashboard-side">
            <DashboardCard title="Heute" action={<Link to="/events">Events</Link>}>
              {todayEvents.map((event) => (
                <DashboardListRow key={event.id} icon="event" title={event.title} meta={`${formatTime(event.startsAt)} · ${event.location ?? 'Straße'}`} to="/events" />
              ))}
              {dashboard && todayEvents.length === 0 && <EmptyRow icon="event" title={query ? 'Keine passenden Events.' : 'Heute steht nichts an.'} />}
            </DashboardCard>

            <DashboardCard title="Urlaub">
              {vacations.map((vacation) => (
                <DashboardListRow key={vacation.id} icon="vacation" title={vacation.name.replace(/^Familie\s+/i, '')} meta={vacation.until ? `bis ${formatDate(vacation.until)}` : 'Status: im Urlaub'} />
              ))}
              {dashboard && vacations.length === 0 && <EmptyRow icon="vacation" title={query ? 'Keine passenden Urlaubsstatus.' : 'Niemand ist aktuell im Urlaub.'} />}
            </DashboardCard>

            <DashboardCard title="Mülltermine" action={<Link to="/kalender">Alle</Link>}>
              {wastePickups.map((entry) => (
                <WastePickupRow key={entry.id} title={entry.title} startsAt={entry.startsAt} />
              ))}
              {dashboard && wastePickups.length === 0 && <EmptyRow icon="trash" title={query ? 'Keine passenden Mülltermine.' : 'Keine Mülltermine gefunden.'} />}
            </DashboardCard>

            <DashboardCard title="Hinweis">
              <div className="dashboard-notice">
                <strong>{dashboard?.notice.title ?? 'Kein Hinweis'}</strong>
                <p>{dashboard?.notice.message ?? 'Aktuell gibt es keinen Straßenhinweis.'}</p>
                <Link className="dashboard-notice-button" to="/strasse">Mehr Informationen</Link>
              </div>
            </DashboardCard>
          </aside>
        </main>

        <button className="dashboard-fab" type="button" onClick={() => setDialogAction('status')}>
          + Status
        </button>
        <ActionDialog
          open={dialogAction !== null}
          title={actionTitle(dialogAction)}
          onClose={() => setDialogAction(null)}
        >
          {dialogAction === 'status' && <HouseholdStatusForm onSaved={handleSaved} />}
          {dialogAction === 'feed' && <NewFeedItemForm key="feed-dialog" initialType="tool_available" onCreated={handleSaved} />}
          {dialogAction === 'help' && <NewFeedItemForm key="help-dialog" initialType="help_needed" onCreated={handleSaved} />}
          {dialogAction === 'event' && <NewCalendarEntryForm onCreated={handleSaved} />}
        </ActionDialog>
        <BottomNavigation />
      </div>
    </div>
  );
}
