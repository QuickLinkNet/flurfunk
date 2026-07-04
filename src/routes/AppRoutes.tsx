import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StreetFeedPage } from '../pages/StreetFeedPage';
import { CalendarPage } from '../pages/CalendarPage';
import { EventsPage } from '../pages/EventsPage';
import { EventDetailPage } from '../pages/EventDetailPage';
import { HouseholdPage } from '../pages/HouseholdPage';
import { useAuth } from '../hooks/useAuth';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registrieren" element={<RegisterPage />} />
      <Route path="/registrieren/:inviteCode" element={<RegisterPage />} />
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
            <StreetFeedPage />
          </RequireAuth>
        }
      />
      <Route
        path="/kalender"
        element={
          <RequireAuth>
            <CalendarPage />
          </RequireAuth>
        }
      />
      <Route
        path="/events"
        element={
          <RequireAuth>
            <EventsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/events/:id"
        element={
          <RequireAuth>
            <EventDetailPage />
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
