import { Select } from '../atoms/Select';
import { CardRow } from '../molecules/CardRow';
import type { AdminUser } from '../../types/admin';
import type { UserRole } from '../../types/user';

interface Props {
  users: AdminUser[];
  onRoleChange: (id: number, role: UserRole) => void;
}

const ROLES: UserRole[] = ['admin', 'member', 'guest'];

export function AdminUserList({ users, onRoleChange }: Props) {
  if (users.length === 0) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Keine Nutzer vorhanden.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {users.map((u) => (
        <CardRow
          key={u.id}
          action={
            <Select value={u.role} onChange={(e) => onRoleChange(u.id, e.target.value as UserRole)} style={{ width: 120 }}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {u.displayName}
          </p>
          <p
            style={{
              margin: 'var(--md-space-1) 0 0',
              fontSize: 'var(--md-font-size-sm)',
              color: 'var(--md-color-on-surface-variant)'
            }}
          >
            {u.email} {u.householdName ? `· ${u.householdName}` : '· kein Haushalt'}
          </p>
        </CardRow>
      ))}
    </div>
  );
}
