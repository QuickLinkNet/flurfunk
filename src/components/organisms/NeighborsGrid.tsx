import { useMemo, useState } from 'react';
import { Input } from '../atoms/Input';
import { NeighborCard } from '../molecules/NeighborCard';
import type { NeighborHousehold } from '../../types/neighbor';

interface Props {
  households: NeighborHousehold[];
}

const STATUS_FILTERS = [
  { id: 'all', label: 'Alle' },
  { id: 'home', label: 'Zuhause' },
  { id: 'away', label: 'Unterwegs' },
  { id: 'vacation', label: 'Urlaub' },
  { id: 'help', label: 'Hilfe' }
] as const;

type StatusFilter = typeof STATUS_FILTERS[number]['id'];

function matchesStatus(household: NeighborHousehold, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  const label = `${household.status?.label ?? ''} ${household.status?.note ?? ''} ${household.vacation?.note ?? ''}`.toLowerCase();
  if (filter === 'home') return label.includes('zuhause');
  if (filter === 'vacation') return label.includes('urlaub');
  if (filter === 'away') return label.includes('unterwegs');
  return label.includes('hilfe') || label.includes('braucht');
}

export function NeighborsGrid({ households }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const counts = useMemo(
    () => ({
      total: households.length,
      home: households.filter((household) => matchesStatus(household, 'home')).length,
      vacation: households.filter((household) => matchesStatus(household, 'vacation')).length,
      help: households.filter((household) => matchesStatus(household, 'help')).length
    }),
    [households]
  );

  const visibleHouseholds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return households.filter((household) => {
      const matchesQuery =
        normalizedQuery === '' ||
        household.name.toLowerCase().includes(normalizedQuery) ||
        household.addressLine.toLowerCase().includes(normalizedQuery) ||
        (household.status?.label ?? '').toLowerCase().includes(normalizedQuery) ||
        (household.status?.note ?? '').toLowerCase().includes(normalizedQuery) ||
        household.children.some((child) => child.name.toLowerCase().includes(normalizedQuery) || (child.locationNote ?? '').toLowerCase().includes(normalizedQuery)) ||
        household.events.some((item) => item.title.toLowerCase().includes(normalizedQuery) || (item.location ?? '').toLowerCase().includes(normalizedQuery));
      return matchesQuery && matchesStatus(household, statusFilter);
    });
  }, [households, query, statusFilter]);

  return (
    <section className="neighbors-panel">
      <div className="neighbors-toolbar">
        <Input
          aria-label="Nachbarn suchen"
          placeholder="Nach Haushalt, Adresse oder Status suchen..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="neighbors-filterbar" aria-label="Status filtern">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              data-active={statusFilter === filter.id}
              onClick={() => setStatusFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="neighbors-summary">
        <span><strong>{visibleHouseholds.length}</strong> sichtbar</span>
        <span><strong>{counts.home}</strong> zuhause</span>
        <span><strong>{counts.vacation}</strong> im Urlaub</span>
        <span><strong>{counts.help}</strong> braucht Hilfe</span>
      </div>

      {visibleHouseholds.length > 0 ? (
        <div className="neighbors-grid">
          {visibleHouseholds.map((household) => (
            <NeighborCard key={household.id} household={household} />
          ))}
        </div>
      ) : (
        <p className="neighbors-empty">Keine Nachbarn passen zu deiner Suche.</p>
      )}
    </section>
  );
}
