import { useState } from 'react';
import { Button } from '../atoms/Button';
import { StatusPill } from '../atoms/StatusPill';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { AdminInviteNeedsBoard } from '../molecules/AdminInviteNeedsBoard';
import { AdminInviteRolloutRow, inviteFollowUpMessage } from '../molecules/AdminInviteRolloutRow';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { inviteMessage, inviteUrl } from '../molecules/InviteCodeRow';
import { purgeAdminInvite, revokeAdminInvite, sendAdminUserPushTest } from '../../api/adminApi';
import type { AdminHousehold } from '../../types/admin';
import type { InviteRolloutFilter } from '../../types/adminInviteRollout';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Props {
  households: AdminHousehold[];
  onChanged: () => void;
}

interface PendingRevoke {
  id: number;
  name: string;
}

interface PendingPurge {
  id: number;
  name: string;
}

const FILTERS: Array<{ id: InviteRolloutFilter; label: string }> = [
  { id: 'all', label: 'Alle' },
  { id: 'open', label: 'Offen' },
  { id: 'used', label: 'Eingelöst' },
  { id: 'onboarding', label: 'Onboarding offen' },
  { id: 'push', label: 'Push offen' },
  { id: 'ready', label: 'Onboarding fertig' },
  { id: 'revoked', label: 'Widerrufen' }
];

function inviteStatus(invite: HouseholdInvitePerson): InviteRolloutFilter {
  if (invite.revokedAt) return 'revoked';
  if (invite.usedAt) return 'used';
  return 'open';
}

function isInviteReady(invite: HouseholdInvitePerson): boolean {
  return Boolean(invite.usedByUser?.onboardingCompletedAt);
}

function isInviteSetupOpen(invite: HouseholdInvitePerson): boolean {
  return Boolean(invite.usedByUser && !invite.usedByUser.onboardingCompletedAt);
}

function matchesFilter(invite: HouseholdInvitePerson, filter: InviteRolloutFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'onboarding') return Boolean(!invite.revokedAt && invite.usedByUser && !invite.usedByUser.onboardingCompletedAt);
  if (filter === 'push') return Boolean(!invite.revokedAt && invite.usedByUser && !invite.usedByUser.pushSubscribed);
  if (filter === 'ready') return Boolean(!invite.revokedAt && isInviteReady(invite));
  return inviteStatus(invite) === filter;
}

export function AdminInviteRollout({ households, onChanged }: Props) {
  const [filter, setFilter] = useState<InviteRolloutFilter>('open');
  const [pendingRevoke, setPendingRevoke] = useState<PendingRevoke | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [pendingPurge, setPendingPurge] = useState<PendingPurge | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [busyPushUserId, setBusyPushUserId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<Record<number, string>>({});
  const [rolloutMessage, setRolloutMessage] = useState<string | null>(null);
  const allInvites = households.flatMap((household) => household.invites);
  const openCount = allInvites.filter((invite) => inviteStatus(invite) === 'open').length;
  const usedCount = allInvites.filter((invite) => inviteStatus(invite) === 'used').length;
  const revokedCount = allInvites.filter((invite) => inviteStatus(invite) === 'revoked').length;
  const readyCount = allInvites.filter(isInviteReady).length;
  const setupOpenCount = allInvites.filter(isInviteSetupOpen).length;
  const householdsWithFilteredInvites = households
    .map((household) => ({
      household,
      invites: household.invites.filter((invite) => matchesFilter(invite, filter))
    }))
    .filter((entry) => entry.invites.length > 0);
  const visibleOpenInvites = householdsWithFilteredInvites
    .flatMap((entry) => entry.invites)
    .filter((invite) => !invite.usedAt && !invite.revokedAt);

  function requestRevoke(invite: HouseholdInvitePerson) {
    setPendingRevoke({
      id: invite.id,
      name: `${invite.firstName} ${invite.lastName}`
    });
  }

  async function confirmRevoke() {
    if (!pendingRevoke) return;

    setIsRevoking(true);
    try {
      await revokeAdminInvite(pendingRevoke.id);
      setPendingRevoke(null);
      onChanged();
    } finally {
      setIsRevoking(false);
    }
  }

  function requestPurge(invite: HouseholdInvitePerson) {
    setPendingPurge({
      id: invite.id,
      name: `${invite.firstName} ${invite.lastName}`
    });
  }

  async function confirmPurge() {
    if (!pendingPurge) return;

    setIsPurging(true);
    try {
      await purgeAdminInvite(pendingPurge.id);
      setPendingPurge(null);
      onChanged();
    } finally {
      setIsPurging(false);
    }
  }

  async function copyFollowUp(invite: HouseholdInvitePerson) {
    try {
      await navigator.clipboard.writeText(inviteFollowUpMessage(invite));
      setActionMessage((current) => ({ ...current, [invite.id]: 'Nachfass-Nachricht kopiert.' }));
    } catch {
      setActionMessage((current) => ({ ...current, [invite.id]: 'Kopieren fehlgeschlagen.' }));
    }
  }

  async function sendPushTest(invite: HouseholdInvitePerson) {
    if (!invite.usedByUser) return;

    setBusyPushUserId(invite.usedByUser.id);
    setActionMessage((current) => ({ ...current, [invite.id]: '' }));
    try {
      const result = await sendAdminUserPushTest(invite.usedByUser.id);
      const message = result.total === 0
        ? 'Kein Push-Abo vorhanden.'
        : `Push-Test: ${result.sent}/${result.total} gesendet.`;
      setActionMessage((current) => ({ ...current, [invite.id]: message }));
      onChanged();
    } catch (err) {
      setActionMessage((current) => ({
        ...current,
        [invite.id]: err instanceof Error ? err.message : 'Push-Test fehlgeschlagen.'
      }));
    } finally {
      setBusyPushUserId(null);
    }
  }

  async function copyVisibleOpenInvites() {
    if (visibleOpenInvites.length === 0) return;

    const text = visibleOpenInvites
      .map((invite) => inviteMessage(invite, inviteUrl(invite.code)))
      .join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setRolloutMessage(`${visibleOpenInvites.length} Einladung${visibleOpenInvites.length === 1 ? '' : 'en'} kopiert.`);
    } catch {
      setRolloutMessage('Kopieren fehlgeschlagen.');
    }
  }

  if (allInvites.length === 0) {
    return <AdminEmptyState>Noch keine Einladungen vorhanden.</AdminEmptyState>;
  }

  return (
    <>
      <div className="admin-rollout-summary">
        <div>
          <strong>{allInvites.length}</strong>
          <span>gesamt</span>
        </div>
        <div>
          <strong>{openCount}</strong>
          <span>offen</span>
        </div>
        <div>
          <strong>{usedCount}</strong>
          <span>eingelöst</span>
        </div>
        <div>
          <strong>{revokedCount}</strong>
          <span>widerrufen</span>
        </div>
        <div>
          <strong>{setupOpenCount}</strong>
          <span>Einrichtung offen</span>
        </div>
        <div>
          <strong>{readyCount}</strong>
          <span>Onboarding fertig</span>
        </div>
      </div>

      <AdminInviteNeedsBoard households={households} onShowStatus={setFilter} />

      <div className="admin-rollout-toolbar">
        <div className="admin-tabs" style={{ paddingBottom: 0 }}>
          {FILTERS.map((item) => (
            <button key={item.id} type="button" data-active={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={copyVisibleOpenInvites} disabled={visibleOpenInvites.length === 0}>
          Sichtbare offene Einladungen kopieren
        </Button>
      </div>
      {rolloutMessage && <p className="admin-rollout-message">{rolloutMessage}</p>}

      {householdsWithFilteredInvites.length > 0 ? (
        <div className="admin-list-stack">
          {householdsWithFilteredInvites.map(({ household, invites }) => (
            <article key={household.id} className="admin-rollout-household">
              <div className="admin-rollout-household-header">
                <div>
                  <strong>{household.name}</strong>
                  <span>{household.addressLine} · {household.streetName}</span>
                </div>
                <StatusPill label={`${invites.length} Einladung${invites.length === 1 ? '' : 'en'}`} />
              </div>
              <div className="admin-list-stack">
                {invites.map((invite) => (
                  <AdminInviteRolloutRow
                    key={invite.id}
                    invite={invite}
                    actionMessage={actionMessage[invite.id]}
                    isPushBusy={busyPushUserId === invite.usedByUser?.id}
                    onCopyFollowUp={copyFollowUp}
                    onEmailSent={() => onChanged()}
                    onPushTest={sendPushTest}
                    onRevoke={requestRevoke}
                    onPurge={requestPurge}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState>Keine Einladungen in diesem Filter.</AdminEmptyState>
      )}

      <ConfirmDialog
        open={pendingRevoke !== null}
        title="Einladungscode widerrufen?"
        description={pendingRevoke ? `Der Code für ${pendingRevoke.name} kann danach nicht mehr verwendet werden.` : ''}
        confirmLabel="Widerrufen"
        loading={isRevoking}
        onCancel={() => setPendingRevoke(null)}
        onConfirm={confirmRevoke}
      />

      <ConfirmDialog
        open={pendingPurge !== null}
        title="Einladung endgültig löschen?"
        description={pendingPurge ? `Der Datensatz für ${pendingPurge.name} wird unwiderruflich entfernt. Das geht nur bei bereits genutzten oder widerrufenen Einladungen.` : ''}
        confirmLabel="Endgültig löschen"
        loading={isPurging}
        onCancel={() => setPendingPurge(null)}
        onConfirm={confirmPurge}
      />
    </>
  );
}
