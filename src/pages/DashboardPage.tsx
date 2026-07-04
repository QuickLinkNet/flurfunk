import { useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { HouseholdStatusList } from '../components/organisms/HouseholdStatusList';
import { fetchVisibleHouseholds } from '../api/householdsApi';
import { useAuth } from '../hooks/useAuth';
import type { Household } from '../types/household';

export function DashboardPage() {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);

  useEffect(() => {
    fetchVisibleHouseholds().then(setHouseholds).catch(() => setHouseholds([]));
  }, []);

  return (
    <DashboardTemplate
      header={
        <div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Guten Morgen</p>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{user?.displayName ?? '...'}</h1>
        </div>
      }
    >
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Wer ist da?</h2>
        <HouseholdStatusList households={households} />
      </section>
    </DashboardTemplate>
  );
}
