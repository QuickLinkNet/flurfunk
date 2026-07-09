import { Link } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { ChildrenManager } from '../components/organisms/ChildrenManager';
import { PetsManager } from '../components/organisms/PetsManager';
import { VisibilitySettingsForm } from '../components/organisms/VisibilitySettingsForm';
import { Heading } from '../components/atoms/Heading';
import { useAuth } from '../hooks/useAuth';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

// Entspricht /haushalt/mein aus der Sitemap (PRD Kapitel 7). Adresse/Erwachsene
// folgen nach demselben Muster wie ChildrenManager/PetsManager.
export function HouseholdPage() {
  const { user } = useAuth();
  const { isEnabled } = useFeatureFlags();
  return (
    <DashboardTemplate header={<Heading level={1}>Mein Haushalt</Heading>}>
      {isEnabled('children') && (
        <section>
          <Heading level={2}>Kinder</Heading>
          <ChildrenManager />
        </section>
      )}
      {isEnabled('pets') && (
        <section>
          <Heading level={2}>Haustiere</Heading>
          <PetsManager />
        </section>
      )}
      <section>
        <Heading level={2}>Sichtbarkeit</Heading>
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
