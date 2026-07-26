import { useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { NeighborsGrid } from '../components/organisms/NeighborsGrid';
import { fetchNeighborHouseholds } from '../api/householdsApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { NeighborHousehold } from '../types/neighbor';

export function NeighborsPage() {
  const [households, setHouseholds] = useState<NeighborHousehold[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchNeighborHouseholds()
      .then((items) => {
        if (!isMounted) return;
        setHouseholds(items);
        setMessage(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setHouseholds([]);
        setMessage(error instanceof Error ? error.message : 'Nachbarn konnten nicht geladen werden.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.neighbors.title} pageSubtitle={PAGE_HEADERS.neighbors.subtitle}>
      {message ? <p className="neighbors-empty">{message}</p> : <NeighborsGrid households={households} />}
    </DashboardTemplate>
  );
}
