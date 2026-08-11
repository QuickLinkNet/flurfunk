import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { householdAvatar } from '../../utils/householdAvatar';
import { splitByStreetSide } from '../../utils/streetMap';
import { startConversation } from '../../api/messageApi';
import type { NeighborHousehold } from '../../types/neighbor';

interface Props {
  households: NeighborHousehold[];
}

function BoardPin({
  household,
  number,
  selected,
  onSelect
}: {
  household: NeighborHousehold;
  number: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const avatar = householdAvatar(household.avatarKey);
  return (
    <button type="button" className="admin-street-map-pin" data-own={household.isOwnHousehold} data-selected={selected} onClick={onSelect}>
      <span className="admin-street-map-avatar" style={{ background: avatar.background }}>{avatar.emoji}</span>
      <span className="admin-street-map-pin-label">{household.isOwnHousehold ? 'Ihr' : household.name}</span>
      <span className="admin-street-map-pin-number">Nr. {number}</span>
    </button>
  );
}

export function StreetMapBoard({ households }: Props) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const { left, right, unplaced } = useMemo(() => splitByStreetSide(households), [households]);

  if (households.length === 0) {
    return <p className="neighbors-empty">Noch keine Haushalte auf der Karte.</p>;
  }

  const selected = households.find((household) => household.id === selectedId) ?? null;

  async function handleStartChat() {
    if (!selected) return;
    setChatError(null);
    setIsStartingChat(true);
    try {
      const conversation = await startConversation(selected.id);
      navigate(`/nachrichten/${conversation.id}`);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Unterhaltung konnte nicht gestartet werden.');
      setIsStartingChat(false);
    }
  }

  return (
    <div className="admin-street-map">
      <div className="admin-street-map-canvas">
        <div className="admin-street-map-column">
          {left.map(({ household, number }) => (
            <BoardPin
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
            <BoardPin
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
          {!selected.isOwnHousehold && (
            <Button type="button" variant="secondary" disabled={isStartingChat} onClick={handleStartChat}>
              {isStartingChat ? 'Öffnet...' : 'Nachricht senden'}
            </Button>
          )}
          {chatError && <p className="admin-street-map-unplaced">{chatError}</p>}
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
