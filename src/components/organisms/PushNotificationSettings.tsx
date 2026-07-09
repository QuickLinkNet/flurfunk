import { useEffect, useState } from 'react';
import { Switch } from '../atoms/Switch';
import { Button } from '../atoms/Button';
import { fetchVapidPublicKey, subscribePush, unsubscribePush, sendTestPush } from '../../api/pushApi';
import { isPushSupported, getCurrentSubscription, enablePush, disablePush } from '../../utils/push';

type Status = 'loading' | 'unsupported' | 'off' | 'on';

export function PushNotificationSettings() {
  const [status, setStatus] = useState<Status>('loading');
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus('unsupported');
      return;
    }
    getCurrentSubscription().then((sub) => setStatus(sub ? 'on' : 'off'));
  }, []);

  async function handleToggle(enabled: boolean) {
    setMessage(null);
    setIsBusy(true);
    try {
      if (enabled) {
        const { publicKey } = await fetchVapidPublicKey();
        const subscription = await enablePush(publicKey);
        await subscribePush(subscription);
        setStatus('on');
      } else {
        const endpoint = await disablePush();
        if (endpoint) await unsubscribePush(endpoint);
        setStatus('off');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Das hat nicht funktioniert.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleTest() {
    setMessage(null);
    setIsBusy(true);
    try {
      const result = await sendTestPush();
      setMessage(result.sent > 0 ? 'Test gesendet — sollte gleich ankommen.' : 'Konnte nicht zugestellt werden.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Test fehlgeschlagen.');
    } finally {
      setIsBusy(false);
    }
  }

  if (status === 'loading') {
    return <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>;
  }

  if (status === 'unsupported') {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
        Push-Benachrichtigungen werden von diesem Gerät/Browser nicht unterstützt.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--md-space-3)' }}>
        <span style={{ fontSize: 'var(--md-font-size-base)' }}>Benachrichtigungen aktiv</span>
        <Switch checked={status === 'on'} onChange={handleToggle} disabled={isBusy} />
      </div>
      {status === 'on' && (
        <Button variant="ghost" onClick={handleTest} disabled={isBusy}>
          Test-Benachrichtigung senden
        </Button>
      )}
      {message && (
        <p style={{ fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)', margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}
