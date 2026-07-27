import { Link } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { ChildrenManager } from '../components/organisms/ChildrenManager';
import { PetsManager } from '../components/organisms/PetsManager';
import { HouseholdStatusForm } from '../components/organisms/HouseholdStatusForm';
import { HouseholdContactForm } from '../components/organisms/HouseholdContactForm';
import { MyHouseholdDetailsForm } from '../components/organisms/MyHouseholdDetailsForm';
import { VisibilitySettingsForm } from '../components/organisms/VisibilitySettingsForm';
import { Heading } from '../components/atoms/Heading';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { useAuth } from '../hooks/useAuth';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

// Entspricht /haushalt/mein aus der Sitemap (PRD Kapitel 7). Adresse/Erwachsene
// folgen nach demselben Muster wie ChildrenManager/PetsManager.
export function HouseholdPage() {
  const { user } = useAuth();
  const { isEnabled } = useFeatureFlags();

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.household.title} pageSubtitle={PAGE_HEADERS.household.subtitle}>
      <section>
        <Heading level={2}>Haushalt</Heading>
        <MyHouseholdDetailsForm />
      </section>
      <section>
        <Heading level={2}>Status</Heading>
        <HouseholdStatusForm />
      </section>
      <section>
        <Heading level={2}>Kontakt</Heading>
        <HouseholdContactForm />
      </section>
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
