import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { JoinStreetPage } from '../pages/JoinStreetPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StreetFeedPage } from '../pages/StreetFeedPage';
import { HelpBoardPage } from '../pages/HelpBoardPage';
import { CalendarPage } from '../pages/CalendarPage';
import { EventsPage } from '../pages/EventsPage';
import { EventDetailPage } from '../pages/EventDetailPage';
import { EventPollDetailPage } from '../pages/EventPollDetailPage';
import { HouseholdPage } from '../pages/HouseholdPage';
import { NeighborsPage } from '../pages/NeighborsPage';
import { StreetMapPage } from '../pages/StreetMapPage';
import { MessagesPage } from '../pages/MessagesPage';
import { MessageDetailPage } from '../pages/MessageDetailPage';
import { SettingsPage } from '../pages/SettingsPage';
import { FeedbackPage } from '../pages/FeedbackPage';
import { AdminPage } from '../pages/AdminPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { WelcomePage } from '../pages/WelcomePage';
import { useAuth } from '../hooks/useAuth';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { FEATURE_LABELS } from '../types/featureFlags';
import type { FeatureKey } from '../types/featureFlags';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireFeature({ feature, children }: { feature: FeatureKey; children: JSX.Element }) {
  const { isEnabled } = useFeatureFlags();
  if (!isEnabled(feature)) {
    return (
      <DashboardTemplate pageTitle={FEATURE_LABELS[feature]} pageSubtitle="Diese Funktion ist aktuell deaktiviert.">
        <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>
          {FEATURE_LABELS[feature]} ist aktuell deaktiviert.
        </p>
      </DashboardTemplate>
    );
  }
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registrieren" element={<RegisterPage />} />
      <Route path="/registrieren/:inviteCode" element={<RegisterPage />} />
      <Route path="/beitreten/:token" element={<JoinStreetPage />} />
      <Route path="/passwort-vergessen" element={<ForgotPasswordPage />} />
      <Route path="/passwort-zuruecksetzen/:token" element={<ResetPasswordPage />} />
      <Route
        path="/start"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/willkommen"
        element={
          <RequireAuth>
            <WelcomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/strasse"
        element={
          <RequireAuth>
            <RequireFeature feature="feed">
              <StreetFeedPage />
            </RequireFeature>
          </RequireAuth>
        }
      />
      <Route
        path="/hilfe"
        element={
          <RequireAuth>
            <RequireFeature feature="feed">
              <HelpBoardPage />
            </RequireFeature>
          </RequireAuth>
        }
      />
      <Route
        path="/kalender"
        element={
          <RequireAuth>
            <RequireFeature feature="calendar">
              <CalendarPage />
            </RequireFeature>
          </RequireAuth>
        }
      />
      <Route
        path="/events"
        element={
          <RequireAuth>
            <RequireFeature feature="events">
              <EventsPage />
            </RequireFeature>
          </RequireAuth>
        }
      />
      <Route
        path="/events/:id"
        element={
          <RequireAuth>
            <RequireFeature feature="events">
              <EventDetailPage />
            </RequireFeature>
          </RequireAuth>
        }
      />
      <Route
        path="/terminfindung/:id"
        element={
          <RequireAuth>
            <RequireFeature feature="events">
              <EventPollDetailPage />
            </RequireFeature>
          </RequireAuth>
        }
      />
      <Route
        path="/nachbarn"
        element={
          <RequireAuth>
            <NeighborsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/karte"
        element={
          <RequireAuth>
            <StreetMapPage />
          </RequireAuth>
        }
      />
      <Route
        path="/nachrichten"
        element={
          <RequireAuth>
            <MessagesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/nachrichten/:id"
        element={
          <RequireAuth>
            <MessageDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/haushalt/mein"
        element={
          <RequireAuth>
            <HouseholdPage />
          </RequireAuth>
        }
      />
      <Route
        path="/einstellungen"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/feedback"
        element={
          <RequireAuth>
            <FeedbackPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
