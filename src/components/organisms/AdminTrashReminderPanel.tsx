import { useCallback, useEffect, useState } from 'react';
import { Button } from '../atoms/Button';
import { fetchAdminTrashReminderPreview, sendAdminTrashReminderNow } from '../../api/adminApi';
import type { AdminTrashReminderPreview } from '../../types/admin';

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(date);
}

export function AdminTrashReminderPanel() {
  const [preview, setPreview] = useState<AdminTrashReminderPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPreview(await fetchAdminTrashReminderPreview());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vorschau konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  async function handleSendNow() {
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const result = await sendAdminTrashReminderNow();
      if (result.entries === 0) {
        setMessage('Für morgen ist kein Mülltermin hinterlegt, es wurde nichts verschickt.');
      } else {
        setMessage(
          `Erinnerung für ${result.titles.join(', ')} verschickt: Push an ${result.push?.sent ?? 0}/${result.push?.total ?? 0}, ` +
            `E-Mail an ${result.mailSent}/${result.mailTotal}.`
        );
      }
      await loadPreview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erinnerung konnte nicht gesendet werden.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-digest-panel">
      <div className="admin-digest-toolbar">
        <div>
          {preview ? (
            <>
              <strong>{formatDate(preview.date)}</strong>
              <span>
                {preview.entries === 0
                  ? 'Kein Mülltermin für morgen hinterlegt.'
                  : `${preview.titles.join(', ')} · noch nicht erinnert`}
              </span>
            </>
          ) : (
            <strong>{loading ? 'Lädt …' : 'Vorschau konnte nicht geladen werden.'}</strong>
          )}
        </div>
        <div className="admin-digest-actions">
          <Button type="button" variant="ghost" onClick={loadPreview} disabled={loading}>
            {loading ? 'Lädt …' : 'Vorschau aktualisieren'}
          </Button>
          <Button type="button" onClick={handleSendNow} disabled={sending || !preview || preview.entries === 0}>
            {sending ? 'Sendet …' : 'Jetzt erinnern'}
          </Button>
        </div>
      </div>

      {message && <p className="admin-rollout-message">{message}</p>}
      {error && <p className="admin-rollout-message">{error}</p>}
    </div>
  );
}
