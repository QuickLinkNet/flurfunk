import { useState } from 'react';
import { Switch } from '../atoms/Switch';
import { useAuth } from '../../hooks/useAuth';

export function TrashReminderSettings() {
  const { user, updateTrashReminderPreference } = useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleToggle(field: 'push' | 'email', enabled: boolean) {
    if (!user) return;
    setIsBusy(true);
    setMessage(null);
    try {
      const push = field === 'push' ? enabled : user.trashReminderPushEnabled;
      const email = field === 'email' ? enabled : user.trashReminderEmailEnabled;
      await updateTrashReminderPreference(push, email);
      setMessage('Gespeichert.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Einstellung konnte nicht gespeichert werden.');
    } finally {
      setIsBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div className="compact-manager">
      <div className="push-settings-row">
        <div>
          <strong style={{ display: 'block', fontSize: 'var(--md-font-size-base)' }}>Mülltermin-Erinnerung per Push</strong>
          <span style={{ display: 'block', marginTop: 2, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
            Am Vorabend erinnern, wenn morgen eine Tonne dran ist. Standardmäßig aus. Setzt aktivierte Push-Benachrichtigungen oben voraus.
          </span>
        </div>
        <Switch checked={user.trashReminderPushEnabled} onChange={(enabled) => handleToggle('push', enabled)} disabled={isBusy} />
      </div>

      <div className="push-settings-row">
        <div>
          <strong style={{ display: 'block', fontSize: 'var(--md-font-size-base)' }}>Mülltermin-Erinnerung per E-Mail</strong>
          <span style={{ display: 'block', marginTop: 2, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
            Dieselbe Erinnerung zusätzlich per E-Mail am Vorabend. Standardmäßig aus.
          </span>
        </div>
        <Switch checked={user.trashReminderEmailEnabled} onChange={(enabled) => handleToggle('email', enabled)} disabled={isBusy} />
      </div>

      {message && (
        <p style={{ fontSize: 'var(--md-font-size-sm)', color: message.includes('nicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)', margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}
