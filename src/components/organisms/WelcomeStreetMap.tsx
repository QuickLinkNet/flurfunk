import { useMemo } from 'react';
import { householdAvatar } from '../../utils/householdAvatar';
import { splitByStreetSide } from '../../utils/streetMap';
import type { NeighborHousehold } from '../../types/neighbor';

interface Props {
  households: NeighborHousehold[];
}

function WelcomePin({ household, number }: { household: NeighborHousehold; number: number }) {
  const avatar = householdAvatar(household.avatarKey);
  return (
    <div className="admin-street-map-pin" data-own={household.isOwnHousehold} style={{ cursor: 'default' }}>
      <span className="admin-street-map-avatar" style={{ background: avatar.background }}>{avatar.emoji}</span>
      <span className="admin-street-map-pin-label">{household.isOwnHousehold ? 'Ihr seid hier' : household.name}</span>
      <span className="admin-street-map-pin-number">Nr. {number}</span>
    </div>
  );
}

export function WelcomeStreetMap({ households }: Props) {
  const { left, right } = useMemo(() => splitByStreetSide(households), [households]);

  if (households.length === 0) {
    return null;
  }

  return (
    <div className="admin-street-map">
      <div className="admin-street-map-canvas">
        <div className="admin-street-map-column">
          {left.map(({ household, number }) => (
            <WelcomePin key={household.id} household={household} number={number} />
          ))}
        </div>
        <div className="admin-street-map-road" aria-hidden="true" />
        <div className="admin-street-map-column">
          {right.map(({ household, number }) => (
            <WelcomePin key={household.id} household={household} number={number} />
          ))}
        </div>
      </div>
    </div>
  );
}
