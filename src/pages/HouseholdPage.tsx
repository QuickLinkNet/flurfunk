import { Link } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { ChildrenManager } from '../components/organisms/ChildrenManager';
import { VisibilitySettingsForm } from '../components/organisms/VisibilitySettingsForm';
import { useAuth } from '../hooks/useAuth';

// Entspricht /haushalt/mein aus der Sitemap (PRD Kapitel 7). Adresse/Erwachsene/
// Haustiere folgen nach demselben Muster wie ChildrenManager.
export function HouseholdPage() {
  const { user } = useAuth();
  return (
    <DashboardTemplate header={<h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mein Haushalt</h1>}>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Kinder</h2>
        <ChildrenManager />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Sichtbarkeit</h2>
        <VisibilitySettingsForm />
      </section>
      <section>
        <Link to="/einstellungen">Einstellungen →</Link>
      </section>
      {user?.role === 'admin' && (
        <section>
          <Link to="/admin">Zur Verwaltung →</Link>
        </section>
      )}
    </DashboardTemplate>
  );
}
