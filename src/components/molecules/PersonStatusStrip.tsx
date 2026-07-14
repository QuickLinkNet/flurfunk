import type { Household } from '../../types/household';
import { HouseholdAvatar } from '../atoms/HouseholdAvatar';

interface Props {
  households: Household[];
}

function statusColor(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes('urlaub')) return 'var(--md-color-primary)';
  if (normalized.includes('hilfe')) return 'var(--md-color-error)';
  if (normalized.includes('unterwegs')) return 'var(--md-color-info)';
  return 'var(--md-color-secondary)';
}

export function PersonStatusStrip({ households }: Props) {
  const visible = households.slice(0, 5);
  const extra = Math.max(0, households.length - visible.length);

  return (
    <div className="dashboard-status-strip">
      {visible.map((household) => (
        <div key={household.id} className="dashboard-household-card">
          <div className="dashboard-avatar-wrap">
            <HouseholdAvatar avatarKey={household.avatarKey} fallback={household.name} size={64} className="dashboard-avatar" />
            <span className="dashboard-status-dot" style={{ background: statusColor(household.statusLabel) }} />
          </div>
          <div>
            <strong>{household.name.replace(/^Familie\s+/i, '')}</strong>
            <span className="dashboard-status-pill">{household.statusLabel}</span>
          </div>
        </div>
      ))}
      {extra > 0 && (
        <div className="dashboard-household-card">
          <div className="dashboard-avatar">
            +{extra}
          </div>
          <div>
            <strong>Weitere</strong>
            <span className="dashboard-status-pill">anzeigen</span>
          </div>
        </div>
      )}
    </div>
  );
}
