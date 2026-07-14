import { Button } from '../atoms/Button';
import { HouseholdAvatar } from '../atoms/HouseholdAvatar';
import { AdminHouseholdMeta } from '../molecules/AdminHouseholdMeta';
import { AdminInviteSection, type InviteFilter } from '../molecules/AdminInviteSection';
import { HouseholdDetailsForm } from '../molecules/HouseholdDetailsForm';
import type { AdminHousehold } from '../../types/admin';

interface Props {
  household: AdminHousehold;
  isEditing: boolean;
  inviteFilter: InviteFilter;
  onToggleEdit: () => void;
  onDelete: () => void;
  onSave: (name: string, addressLine: string, avatarKey: string) => Promise<void>;
  onInviteFilterChange: (filter: InviteFilter) => void;
  onRevokeInvite: (id: number) => void;
  onInvitesChanged: () => void;
}

export function AdminHouseholdCard({
  household,
  isEditing,
  inviteFilter,
  onToggleEdit,
  onDelete,
  onSave,
  onInviteFilterChange,
  onRevokeInvite,
  onInvitesChanged
}: Props) {
  return (
    <article
      style={{
        padding: 'var(--md-space-4)',
        borderRadius: 'var(--md-radius-card)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)',
        boxShadow: 'var(--md-shadow-card)'
      }}
    >
      <div className="md-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-space-3)', minWidth: 0 }}>
          <HouseholdAvatar avatarKey={household.avatarKey} fallback={household.name} size={42} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
              {household.name}
            </p>
            <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
              {household.addressLine} · {household.streetName}
            </p>
          </div>
        </div>
        <div className="md-card-actions">
          <Button type="button" variant="ghost" onClick={onToggleEdit}>
            {isEditing ? 'Schließen' : 'Bearbeiten'}
          </Button>
          <Button type="button" variant="ghost" onClick={onDelete}>
            Löschen
          </Button>
        </div>
      </div>

      {isEditing && (
        <section style={{ marginTop: 'var(--md-space-3)' }}>
          <HouseholdDetailsForm
            initialName={household.name}
            initialAddressLine={household.addressLine}
            initialAvatarKey={household.avatarKey}
            submitLabel="Haushalt speichern"
            onSave={onSave}
          />
        </section>
      )}

      <AdminHouseholdMeta household={household} />
      <AdminInviteSection
        household={household}
        inviteFilter={inviteFilter}
        onFilterChange={onInviteFilterChange}
        onRevokeInvite={onRevokeInvite}
        onInvitesChanged={onInvitesChanged}
      />
    </article>
  );
}
