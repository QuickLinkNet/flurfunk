import { useState } from 'react';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';
import { StatusPill } from '../atoms/StatusPill';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { AdminListStack } from '../molecules/AdminListStack';
import { CardRow } from '../molecules/CardRow';
import { sendAdminUserPushTest } from '../../api/adminApi';
import type { AdminPushTestResult } from '../../api/adminApi';
import type { AdminUser } from '../../types/admin';
import type { UserRole } from '../../types/user';
import { onboardingStatusLabel } from '../../utils/onboardingStatus';

interface Props {
  users: AdminUser[];
  onRoleChange: (id: number, role: UserRole) => void;
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

export function AdminUserList({ users, onRoleChange, onPushTestComplete }: Props) {
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [pushMessage, setPushMessage] = useState<Record<number, string>>({});

  async function handlePushTest(userId: number) {
    setBusyUserId(userId);
    setPushMessage((current) => ({ ...current, [userId]: '' }));
    try {
      const result = await sendAdminUserPushTest(userId);
      setPushMessage((current) => ({
        ...current,
        [userId]: pushResultMessage(result)
      }));
      onPushTestComplete?.();
    } catch (err) {
      setPushMessage((current) => ({
        ...current,
        [userId]: err instanceof Error ? err.message : 'Push-Test fehlgeschlagen.'
      }));
    } finally {
      setBusyUserId(null);
    }
  }

  if (users.length === 0) {
    return <AdminEmptyState>Keine Nutzer vorhanden.</AdminEmptyState>;
  }

  return (
    <AdminListStack>
      {users.map((u) => (
        <CardRow
          key={u.id}
          action={
            <div style={{ display: 'flex', gap: 'var(--md-space-2)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                onClick={() => handlePushTest(u.id)}
                disabled={busyUserId === u.id}
                style={{ padding: 'var(--md-space-2) var(--md-space-3)', fontSize: 'var(--md-font-size-sm)' }}
              >
                {busyUserId === u.id ? 'Sendet ...' : 'Push testen'}
              </Button>
              <Select value={u.role} onChange={(e) => onRoleChange(u.id, e.target.value as UserRole)} style={{ width: 120 }}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </div>
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {u.displayName}
          </p>
          <div style={{ display: 'flex', gap: 'var(--md-space-2)', flexWrap: 'wrap', marginTop: 'var(--md-space-2)' }}>
            <StatusPill
              label={onboardingStatusLabel(u.onboardingCompletedAt, u.onboardingCurrentStep)}
              tone={u.onboardingCompletedAt ? 'success' : 'neutral'}
            />
            <StatusPill label={u.pushSubscribed ? 'Push aktiv' : 'Push inaktiv'} tone={u.pushSubscribed ? 'success' : 'neutral'} />
          </div>
          <p
            style={{
              margin: 'var(--md-space-1) 0 0',
              fontSize: 'var(--md-font-size-sm)',
              color: 'var(--md-color-on-surface-variant)'
            }}
          >
            {u.email} {u.householdName ? `- ${u.householdName}` : '- kein Haushalt'}
          </p>
          <p
            style={{
              margin: 'var(--md-space-1) 0 0',
              fontSize: 'var(--md-font-size-sm)',
              color: 'var(--md-color-on-surface-variant)'
            }}
          >
            {pushMessage[u.id] ? `Push-Test: ${pushMessage[u.id]}` : 'Noch kein Push-Test in dieser Sitzung.'}
          </p>
        </CardRow>
      ))}
    </AdminListStack>
  );
}
