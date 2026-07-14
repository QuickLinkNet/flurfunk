import { AdminAddInviteForm } from './AdminAddInviteForm';
import { InviteCodeRow } from './InviteCodeRow';
import type { AdminHousehold } from '../../types/admin';

export type InviteFilter = 'all' | 'open' | 'used' | 'revoked';

interface Props {
  household: AdminHousehold;
  inviteFilter: InviteFilter;
  onFilterChange: (filter: InviteFilter) => void;
  onRevokeInvite: (id: number) => void;
  onInvitesChanged: () => void;
}

const INVITE_FILTERS: Array<{ id: InviteFilter; label: string }> = [
  { id: 'all', label: 'Alle' },
  { id: 'open', label: 'Offen' },
  { id: 'used', label: 'Eingelöst' },
  { id: 'revoked', label: 'Widerrufen' }
];

function matchesInviteFilter(invite: AdminHousehold['invites'][number], filter: InviteFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'open') return !invite.usedAt && !invite.revokedAt;
  if (filter === 'used') return Boolean(invite.usedAt);
  return Boolean(invite.revokedAt);
}

export function AdminInviteSection({ household, inviteFilter, onFilterChange, onRevokeInvite, onInvitesChanged }: Props) {
  const openInvites = household.invites.filter((invite) => !invite.usedAt && !invite.revokedAt).length;
  const usedInvites = household.invites.filter((invite) => invite.usedAt).length;
  const revokedInvites = household.invites.filter((invite) => invite.revokedAt).length;
  const filteredInvites = household.invites.filter((invite) => matchesInviteFilter(invite, inviteFilter));

  return (
    <>
      <section style={{ marginTop: 'var(--md-space-4)' }}>
        <div className="md-card-header" style={{ marginBottom: 'var(--md-space-2)' }}>
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-sm)', fontWeight: 'var(--md-font-weight-medium)' }}>
            Einladungscodes ({openInvites} offen / {usedInvites} eingelöst / {revokedInvites} widerrufen)
          </p>
          <div className="admin-tabs" style={{ paddingBottom: 0 }}>
            {INVITE_FILTERS.map((filter) => (
              <button key={filter.id} type="button" data-active={inviteFilter === filter.id} onClick={() => onFilterChange(filter.id)}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="md-stack" style={{ gap: 'var(--md-space-2)' }}>
          {filteredInvites.length > 0 ? (
            filteredInvites.map((invite) => <InviteCodeRow key={invite.id} invite={invite} onRevoke={onRevokeInvite} />)
          ) : (
            <p style={{ margin: 0, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
              Keine Einladungen in diesem Filter.
            </p>
          )}
        </div>
      </section>

      <AdminAddInviteForm householdId={household.id} onAdded={onInvitesChanged} />
    </>
  );
}
