import { Select } from '../atoms/Select';
import type { AdminUser } from '../../types/admin';
import type { UserRole } from '../../types/user';

interface Props {
  users: AdminUser[];
  onRoleChange: (id: number, role: UserRole) => void;
}

const ROLES: UserRole[] = ['admin', 'member', 'guest'];

export function AdminUserList({ users, onRoleChange }: Props) {
  if (users.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Keine Nutzer vorhanden.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {users.map((u) => (
        <div
          key={u.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 'var(--md-radius-control)',
            background: 'var(--md-color-surface)',
            border: '1px solid var(--md-color-border)'
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{u.displayName}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--md-color-on-surface-variant)' }}>
              {u.email} {u.householdName ? `· ${u.householdName}` : '· kein Haushalt'}
            </p>
          </div>
          <Select
            value={u.role}
            onChange={(e) => onRoleChange(u.id, e.target.value as UserRole)}
            style={{ width: 120 }}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );
}
