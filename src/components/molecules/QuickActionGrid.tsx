import { useNavigate } from 'react-router-dom';
import { EmojiBadge } from '../atoms/EmojiBadge';

export type QuickActionId = 'status' | 'feed' | 'event' | 'help';

const ACTIONS: Array<{ id: QuickActionId; label: string; description: string; icon: string; to: string }> = [
  { id: 'status', label: 'Status ändern', description: 'Zuhause, unterwegs oder im Urlaub', icon: '🏠', to: '/haushalt/mein' },
  { id: 'feed', label: 'Kurzmeldung', description: 'Nachricht an die Nachbarschaft', icon: '💬', to: '/strasse' },
  { id: 'event', label: 'Event planen', description: 'Gemeinsame Zeit organisieren', icon: '📅', to: '/events' },
  { id: 'help', label: 'Hilfe suchen', description: 'Unterstützung anfragen', icon: '🙋', to: '/strasse' }
];

interface Props {
  onAction?: (action: QuickActionId) => void;
  activeAction?: QuickActionId | null;
}

export function QuickActionGrid({ onAction, activeAction }: Props) {
  const navigate = useNavigate();

  function handleAction(action: (typeof ACTIONS)[number]) {
    if (onAction) {
      onAction(action.id);
      return;
    }
    navigate(action.to);
  }

  return (
    <div className="dashboard-action-grid">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => handleAction(action)}
          className="dashboard-action-tile"
          data-active={activeAction === action.id}
        >
          <EmojiBadge className="dashboard-action-icon" emoji={action.icon} size={44} />
          <span className="dashboard-action-copy">
            <strong>{action.label}</strong>
            <span>{action.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
