import { useMemo, useState } from 'react';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';
import { StatusPill } from '../atoms/StatusPill';
import { UserAvatar } from '../atoms/UserAvatar';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { sendAdminUserPushTest } from '../../api/adminApi';
import { useAuth } from '../../hooks/useAuth';
import type { AdminPushTestResult } from '../../api/adminApi';
import type { AdminUser } from '../../types/admin';
import type { UserRole } from '../../types/user';
import { onboardingStatusLabel } from '../../utils/onboardingStatus';

interface Props {
  users: AdminUser[];
  onRoleChange: (id: number, role: UserRole) => void | Promise<void>;
  onDelete: (user: AdminUser) => void;
  onPushTestComplete?: () => void;
}

const ROLES: UserRole[] = ['admin', 'member', 'guest'];

function pushResultMessage(result: AdminPushTestResult): string {
  if (result.total === 0) return 'Keine Push-Anmeldung vorhanden.';
  const codes = result.statuses.length > 0 ? ` Codes: ${result.statuses.join(', ')}` : '';
  if (result.sent > 0 && result.failed === 0 && result.removed === 0) {
    return `Test gesendet (${result.sent}/${result.total}).${codes}`;
  }
  return `Gesendet: ${result.sent}/${result.total}, fehlgeschlagen: ${result.failed}, entfernt: ${result.removed}.${codes}`;
}

function householdLabel(user: AdminUser): string {
  if (user.householdName) return user.householdName;
  if (user.householdId !== null) return 'Haushalt nicht mehr gefunden';
  return 'Kein Haushalt zugeordnet';
}

export function AdminUserList({ users, onRoleChange, onDelete, onPushTestComplete }: Props) {
  const { user: currentUser } = useAuth();
  const [busyPushUserId, setBusyPushUserId] = useState<number | null>(null);
  const [busyRoleUserId, setBusyRoleUserId] = useState<number | null>(null);
  const [messageByUser, setMessageByUser] = useState<Record<number, string>>({});
  const adminCount = useMemo(() => users.filter((user) => user.role === 'admin').length, [users]);

  async function handlePushTest(userId: number) {
    setBusyPushUserId(userId);
    setMessageByUser((current) => ({ ...current, [userId]: '' }));
    try {
      const result = await sendAdminUserPushTest(userId);
      setMessageByUser((current) => ({ ...current, [userId]: `Push-Test: ${pushResultMessage(result)}` }));
      onPushTestComplete?.();
    } catch (err) {
      setMessageByUser((current) => ({
        ...current,
        [userId]: err instanceof Error ? err.message : 'Push-Test fehlgeschlagen.'
      }));
    } finally {
      setBusyPushUserId(null);
    }
  }

  async function handleRoleChange(user: AdminUser, role: UserRole) {
    if (role === user.role) return;
    setBusyRoleUserId(user.id);
    setMessageByUser((current) => ({ ...current, [user.id]: '' }));
    try {
      await onRoleChange(user.id, role);
      setMessageByUser((current) => ({ ...current, [user.id]: 'Rolle aktualisiert.' }));
    } catch (err) {
      setMessageByUser((current) => ({
        ...current,
        [user.id]: err instanceof Error ? err.message : 'Rolle konnte nicht geändert werden.'
      }));
    } finally {
      setBusyRoleUserId(null);
    }
  }

  if (users.length === 0) {
    return <AdminEmptyState>Keine Nutzer vorhanden.</AdminEmptyState>;
  }

  return (
    <div className="admin-user-list">
      {users.map((adminUser) => {
        const isCurrentUser = currentUser?.id === adminUser.id;
        const isOnlyAdmin = adminUser.role === 'admin' && adminCount <= 1;
        const canDelete = !isCurrentUser;
        const canChangeRole = !isCurrentUser;
        const hasMissingHousehold = adminUser.householdId !== null && !adminUser.householdName;

        return (
          <article key={adminUser.id} className="admin-user-card" data-warning={hasMissingHousehold || isOnlyAdmin}>
            <div className="admin-user-main">
              <UserAvatar avatarUrl={null} fallback={adminUser.displayName || adminUser.email} size={48} />
              <div>
                <div className="admin-user-title">
                  <strong>{adminUser.displayName}</strong>
                  {isCurrentUser && <StatusPill label="Du" tone="success" />}
                  <StatusPill label={adminUser.role} />
                </div>
                <p>{adminUser.email}</p>
                <p>{householdLabel(adminUser)}</p>
              </div>
            </div>

            <div className="admin-user-status">
              <StatusPill
                label={onboardingStatusLabel(adminUser.onboardingCompletedAt, adminUser.onboardingCurrentStep)}
                tone={adminUser.onboardingCompletedAt ? 'success' : 'neutral'}
              />
              <StatusPill label={adminUser.pushSubscribed ? 'Push aktiv' : 'Push inaktiv'} tone={adminUser.pushSubscribed ? 'success' : 'neutral'} />
              {hasMissingHousehold && <StatusPill label="Haushalt fehlt" />}
              {isOnlyAdmin && <StatusPill label="Letzter Admin" />}
            </div>

            <div className="admin-user-actions">
              <Button
                variant="ghost"
                onClick={() => handlePushTest(adminUser.id)}
                disabled={busyPushUserId === adminUser.id}
              >
                {busyPushUserId === adminUser.id ? 'Sendet...' : 'Push testen'}
              </Button>
              <Select
                value={adminUser.role}
                disabled={!canChangeRole || busyRoleUserId === adminUser.id}
                onChange={(event) => handleRoleChange(adminUser, event.target.value as UserRole)}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
              <Button variant="ghost" onClick={() => onDelete(adminUser)} disabled={!canDelete}>
                Löschen
              </Button>
            </div>

            {(messageByUser[adminUser.id] || isCurrentUser || hasMissingHousehold) && (
              <p className="admin-user-message" data-error={messageByUser[adminUser.id]?.includes('nicht') || messageByUser[adminUser.id]?.includes('fehlgeschlagen')}>
                {messageByUser[adminUser.id] ||
                  (isCurrentUser
                    ? 'Eigenen Admin-Zugang kannst du hier nicht löschen oder herabstufen.'
                    : 'Dieser Nutzer verweist auf einen Haushalt, der nicht mehr in der Verwaltung sichtbar ist.')}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
