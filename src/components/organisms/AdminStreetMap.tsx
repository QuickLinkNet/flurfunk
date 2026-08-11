import { useMemo, useState } from 'react';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { householdAvatar } from '../../utils/householdAvatar';
import { splitByStreetSide } from '../../utils/streetMap';
import type { AdminHousehold } from '../../types/admin';

interface Props {
  households: AdminHousehold[];
}

function StreetPin({
  household,
  number,
  selected,
  onSelect
}: {
  household: AdminHousehold;
  number: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const avatar = householdAvatar(household.avatarKey);
  return (
    <button type="button" className="admin-street-map-pin" data-selected={selected} onClick={onSelect}>
      <span className="admin-street-map-avatar" style={{ background: avatar.background }}>{avatar.emoji}</span>
      <span className="admin-street-map-pin-label">{household.name}</span>
      <span className="admin-street-map-pin-number">Nr. {number}</span>
    </button>
  );
}

export function AdminStreetMap({ households }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { left, right, unplaced } = useMemo(() => splitByStreetSide(households), [households]);

  if (households.length === 0) {
    return <AdminEmptyState>Noch keine Haushalte vorhanden.</AdminEmptyState>;
  }

  const selected = households.find((household) => household.id === selectedId) ?? null;

  return (
    <div className="admin-street-map">
      <div className="admin-street-map-canvas">
        <div className="admin-street-map-column">
          {left.map(({ household, number }) => (
            <StreetPin
              key={household.id}
              household={household}
              number={number}
              selected={selectedId === household.id}
              onSelect={() => setSelectedId(household.id)}
            />
          ))}
        </div>
        <div className="admin-street-map-road" aria-hidden="true" />
        <div className="admin-street-map-column">
          {right.map(({ household, number }) => (
            <StreetPin
              key={household.id}
              household={household}
              number={number}
              selected={selectedId === household.id}
              onSelect={() => setSelectedId(household.id)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <div className="admin-street-map-detail">
          <div className="admin-street-map-detail-header">
            <span className="admin-street-map-avatar admin-street-map-avatar--lg" style={{ background: householdAvatar(selected.avatarKey).background }}>
              {householdAvatar(selected.avatarKey).emoji}
            </span>
            <div>
              <strong>{selected.name}</strong>
              <p>{selected.addressLine}</p>
            </div>
          </div>
          {selected.members.length > 0 && (
            <ul className="admin-street-map-members">
              {selected.members.map((member) => (
                <li key={member.id}>{member.displayName}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {unplaced.length > 0 && (
        <p className="admin-street-map-unplaced">
          Ohne erkennbare Hausnummer in der Adresse (steht daher nicht auf der Karte): {unplaced.map((household) => household.name).join(', ')}
        </p>
      )}
    </div>
  );
}
