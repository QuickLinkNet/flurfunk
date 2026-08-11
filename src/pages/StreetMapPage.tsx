import { useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { StreetMapBoard } from '../components/organisms/StreetMapBoard';
import { fetchNeighborHouseholds } from '../api/householdsApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { NeighborHousehold } from '../types/neighbor';

export function StreetMapPage() {
  const [households, setHouseholds] = useState<NeighborHousehold[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNeighborHouseholds()
      .then((items) => {
        setHouseholds(items);
        setMessage(null);
      })
      .catch((error) => {
        setHouseholds([]);
        setMessage(error instanceof Error ? error.message : 'Karte konnte nicht geladen werden.');
      });
  }, []);

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.streetMap.title} pageSubtitle={PAGE_HEADERS.streetMap.subtitle}>
      {message ? <p className="neighbors-empty">{message}</p> : <StreetMapBoard households={households} />}
    </DashboardTemplate>
  );
}
