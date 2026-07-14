import { useState } from 'react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { AdminHouseholdCard } from './AdminHouseholdCard';
import { revokeAdminInvite, updateAdminHousehold } from '../../api/adminApi';
import type { AdminHousehold } from '../../types/admin';
import type { InviteFilter } from '../molecules/AdminInviteSection';

interface Props {
  households: AdminHousehold[];
  onDelete: (id: number) => void | Promise<void>;
  onInvitesChanged: () => void;
  onHouseholdChanged: () => void;
}

type PendingAction =
  | {
      type: 'revokeInvite';
      id: number;
      title: string;
      description: string;
      confirmLabel: string;
    }
  | {
      type: 'deleteHousehold';
      id: number;
      title: string;
      description: string;
      confirmLabel: string;
    };

export function AdminHouseholdList({ households, onDelete, onInvitesChanged, onHouseholdChanged }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [inviteFilter, setInviteFilter] = useState<InviteFilter>('open');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  if (households.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Keine Haushalte vorhanden.
      </p>
    );
  }

  function requestRevokeInvite(id: number) {
    setPendingAction({
      type: 'revokeInvite',
      id,
      title: 'Einladungscode widerrufen?',
      description: 'Der Code kann danach nicht mehr für eine Registrierung genutzt werden.',
      confirmLabel: 'Widerrufen'
    });
  }

  function requestDeleteHousehold(id: number, name: string) {
    setPendingAction({
      type: 'deleteHousehold',
      id,
      title: 'Haushalt löschen?',
      description: `Der Haushalt "${name}" wird mit Kindern, Haustieren, Feed und Events gelöscht.`,
      confirmLabel: 'Löschen'
    });
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;

    setConfirmLoading(true);
    try {
      if (pendingAction.type === 'revokeInvite') {
        await revokeAdminInvite(pendingAction.id);
        onInvitesChanged();
      } else {
        await onDelete(pendingAction.id);
      }
      setPendingAction(null);
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <>
      <div className="md-stack">
        {households.map((household) => (
          <AdminHouseholdCard
            key={household.id}
            household={household}
            isEditing={editingId === household.id}
            inviteFilter={inviteFilter}
            onToggleEdit={() => setEditingId((current) => (current === household.id ? null : household.id))}
            onDelete={() => requestDeleteHousehold(household.id, household.name)}
            onSave={async (name, addressLine, avatarKey) => {
              await updateAdminHousehold(household.id, name, addressLine, avatarKey);
              onHouseholdChanged();
              setEditingId(null);
            }}
            onInviteFilterChange={setInviteFilter}
            onRevokeInvite={requestRevokeInvite}
            onInvitesChanged={onInvitesChanged}
          />
        ))}
      </div>
      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.title ?? ''}
        description={pendingAction?.description ?? ''}
        confirmLabel={pendingAction?.confirmLabel}
        loading={confirmLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </>
  );
}
