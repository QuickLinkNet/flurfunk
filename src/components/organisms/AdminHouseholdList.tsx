import { Button } from '../atoms/Button';
import { AdminAddInviteForm } from '../molecules/AdminAddInviteForm';
import type { AdminHousehold } from '../../types/admin';

interface Props {
  households: AdminHousehold[];
  onDelete: (id: number) => void;
  onInvitesChanged: () => void;
}

export function AdminHouseholdList({ households, onDelete, onInvitesChanged }: Props) {
  if (households.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Keine Haushalte vorhanden.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {households.map((h) => (
        <div
          key={h.id}
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--md-radius-card)',
            background: 'var(--md-color-surface)',
            border: '1px solid var(--md-color-border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                {h.statusEmoji} {h.name}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
                {h.addressLine} · {h.streetName}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm(`Haushalt "${h.name}" wirklich löschen? Kinder/Feed/Events werden mitgelöscht.`)) {
                  onDelete(h.id);
                }
              }}
            >
              Löschen
            </Button>
          </div>
          {h.members.length > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: 12 }}>
              Mitglieder: {h.members.map((m) => `${m.displayName} (${m.role})`).join(', ')}
            </p>
          )}
          {h.children.length > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>
              Kinder: {h.children.map((c) => `${c.name} (${c.currentLocation})`).join(', ')}
            </p>
          )}
          {h.pets.length > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>
              Haustiere: {h.pets.map((p) => `${p.name} (${p.type})`).join(', ')}
            </p>
          )}
          {h.invites.length > 0 && (
            <div style={{ margin: '8px 0 0' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500 }}>Einladungscodes:</p>
              {h.invites.map((invite) => (
                <p key={invite.id} style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
                  {invite.firstName} {invite.lastName}: <strong>{invite.code}</strong>{' '}
                  {invite.usedAt ? '· eingelöst' : '· offen'}
                </p>
              ))}
            </div>
          )}
          <AdminAddInviteForm householdId={h.id} onAdded={onInvitesChanged} />
        </div>
      ))}
    </div>
  );
}
