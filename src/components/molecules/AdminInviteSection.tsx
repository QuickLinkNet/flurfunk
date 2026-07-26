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
  const sentInvites = household.invites.filter((invite) => invite.emailLastSentAt && !invite.usedAt && !invite.revokedAt).length;
  const filteredInvites = household.invites.filter((invite) => matchesInviteFilter(invite, inviteFilter));

  return (
    <section className="admin-invite-section">
      <div className="admin-invite-section-header">
        <div>
          <strong>Einladungscodes</strong>
          <p>{openInvites} offen · {sentInvites} versendet · {usedInvites} eingelöst · {revokedInvites} widerrufen</p>
        </div>
        <div className="admin-tabs">
          {INVITE_FILTERS.map((filter) => (
            <button key={filter.id} type="button" data-active={inviteFilter === filter.id} onClick={() => onFilterChange(filter.id)}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-invite-list">
        {filteredInvites.length > 0 ? (
          filteredInvites.map((invite) => (
            <InviteCodeRow
              key={invite.id}
              invite={invite}
              onEmailSent={() => onInvitesChanged()}
              onRevoke={onRevokeInvite}
            />
          ))
        ) : (
          <p className="admin-empty-state">Keine Einladungen in diesem Filter.</p>
        )}
      </div>

      <AdminAddInviteForm householdId={household.id} onAdded={onInvitesChanged} />
    </section>
  );
}
