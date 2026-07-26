import { useState } from 'react';
import { Switch } from '../atoms/Switch';
import { useAuth } from '../../hooks/useAuth';

export function EmailNotificationSettings() {
  const { user, updateDigestPreference } = useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleToggle(enabled: boolean) {
    setIsBusy(true);
    setMessage(null);
    try {
      await updateDigestPreference(enabled);
      setMessage(enabled ? 'Wochenblick per E-Mail aktiviert.' : 'Wochenblick per E-Mail deaktiviert.');
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
          <strong style={{ display: 'block', fontSize: 'var(--md-font-size-base)' }}>Wochenblick per E-Mail</strong>
          <span style={{ display: 'block', marginTop: 2, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
            Einmal pro Woche eine kurze Zusammenfassung aus der Straße erhalten.
          </span>
        </div>
        <Switch checked={user.weeklyDigestEnabled} onChange={handleToggle} disabled={isBusy} />
      </div>

      {message && (
        <p style={{ fontSize: 'var(--md-font-size-sm)', color: message.includes('nicht') || message.includes('fehl') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)', margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}
