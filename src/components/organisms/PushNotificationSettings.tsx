import { useEffect, useState } from 'react';
import { Switch } from '../atoms/Switch';
import { Button } from '../atoms/Button';
import { fetchPushStatus, fetchVapidPublicKey, sendTestPush, subscribePush, unsubscribePush } from '../../api/pushApi';
import { disablePush, enablePush, getCurrentSubscription, isPushSupported } from '../../utils/push';

type Status = 'loading' | 'unsupported' | 'blocked' | 'off' | 'local-only' | 'on';

function permissionState(): NotificationPermission | 'unsupported' {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

function statusLabel(status: Status): string {
  if (status === 'on') return 'Aktiv';
  if (status === 'local-only') return 'Nur im Browser aktiv';
  if (status === 'blocked') return 'Blockiert';
  if (status === 'unsupported') return 'Nicht unterstützt';
  if (status === 'loading') return 'Wird geprüft';
  return 'Inaktiv';
}

function statusText(status: Status): string {
  if (status === 'on') return 'Dieses Gerät ist für Push-Benachrichtigungen angemeldet.';
  if (status === 'local-only') return 'Der Browser hat ein Abo, der Server kennt es aber nicht. Einmal aus- und wieder einschalten.';
  if (status === 'blocked') return 'Benachrichtigungen sind im Browser blockiert. Bitte in den Website-Einstellungen freigeben.';
  if (status === 'unsupported') return 'Dieser Browser oder dieses Gerät unterstützt Push-Benachrichtigungen nicht.';
  if (status === 'loading') return 'Status wird geprüft...';
  return 'Push ist auf diesem Gerät noch nicht aktiviert.';
}

export function PushNotificationSettings() {
  const [status, setStatus] = useState<Status>('loading');
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshStatus(showFeedback = false) {
    try {
      if (!isPushSupported()) {
        setStatus('unsupported');
        if (showFeedback) setMessage(statusText('unsupported'));
        return;
      }
      if (permissionState() === 'denied') {
        setStatus('blocked');
        if (showFeedback) setMessage(statusText('blocked'));
        return;
      }

      const [subscription, serverStatus] = await Promise.all([
        getCurrentSubscription(),
        fetchPushStatus().catch(() => ({ subscribed: false }))
      ]);

      const nextStatus = subscription && serverStatus.subscribed ? 'on' : subscription ? 'local-only' : 'off';
      setStatus(nextStatus);
      if (showFeedback) setMessage(statusText(nextStatus));
    } catch (err) {
      setStatus('off');
      setMessage(err instanceof Error ? err.message : 'Push-Status konnte nicht geprüft werden.');
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  async function handleToggle(enabled: boolean) {
    setMessage(null);
    setIsBusy(true);
    try {
      if (enabled) {
        const { publicKey } = await fetchVapidPublicKey();
        const subscription = await enablePush(publicKey);
        await subscribePush(subscription);
        setMessage('Benachrichtigungen aktiviert.');
      } else {
        const endpoint = await disablePush();
        if (endpoint) await unsubscribePush(endpoint);
        setMessage('Benachrichtigungen deaktiviert.');
      }
      await refreshStatus();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Das hat nicht funktioniert.');
      await refreshStatus();
    } finally {
      setIsBusy(false);
    }
  }

  async function handleTest() {
    setMessage(null);
    setIsBusy(true);
    try {
      const result = await sendTestPush();
      const codes = result.statuses?.length ? ` Codes: ${result.statuses.join(', ')}` : '';
      setMessage(result.sent > 0 ? `Test gesendet (${result.sent}/${result.total}).${codes}` : `Konnte nicht zugestellt werden.${codes}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Test fehlgeschlagen.');
    } finally {
      setIsBusy(false);
      await refreshStatus();
    }
  }

  return (
    <div className="compact-manager">
      <div className="push-settings-row">
        <div>
          <strong style={{ display: 'block', fontSize: 'var(--md-font-size-base)' }}>{statusLabel(status)}</strong>
          <span style={{ display: 'block', marginTop: 2, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
            {statusText(status)}
          </span>
        </div>
        <Switch checked={status === 'on'} onChange={handleToggle} disabled={isBusy || status === 'unsupported' || status === 'blocked' || status === 'loading'} />
      </div>

      <div className="md-card-actions">
        <Button type="button" variant="ghost" onClick={() => refreshStatus(true)} disabled={isBusy || status === 'loading'}>
          Status prüfen
        </Button>
        <Button type="button" variant="ghost" onClick={handleTest} disabled={isBusy || status !== 'on'}>
          Test senden
        </Button>
      </div>

      {message && (
        <p style={{ fontSize: 'var(--md-font-size-sm)', color: message.includes('nicht') || message.includes('fehl') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)', margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}
