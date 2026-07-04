import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { ChildrenManager } from '../components/organisms/ChildrenManager';

// Entspricht /haushalt/mein aus der Sitemap (PRD Kapitel 7). Adresse/Erwachsene/
// Haustiere/Sichtbarkeit folgen nach demselben Muster wie ChildrenManager.
export function HouseholdPage() {
  return (
    <DashboardTemplate header={<h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mein Haushalt</h1>}>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Kinder</h2>
        <ChildrenManager />
      </section>
    </DashboardTemplate>
  );
}
