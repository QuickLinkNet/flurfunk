import { useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { HouseholdStatusList } from '../components/organisms/HouseholdStatusList';
import { Heading } from '../components/atoms/Heading';
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
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
            Guten Morgen
          </p>
          <Heading level={1}>{user?.displayName ?? '...'}</Heading>
        </div>
      }
    >
      <section>
        <Heading level={2}>Wer ist da?</Heading>
        <HouseholdStatusList households={households} />
      </section>
    </DashboardTemplate>
  );
}
