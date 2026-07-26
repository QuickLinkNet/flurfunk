import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../atoms/Button';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { fetchAdminDigestPreview, sendAdminDigestTest, sendAdminDigestToAll } from '../../api/adminApi';
import type { AdminWeeklyDigest } from '../../types/admin';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
}

export function AdminDigestPanel() {
  const [digest, setDigest] = useState<AdminWeeklyDigest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [confirmSendAllOpen, setConfirmSendAllOpen] = useState(false);

  const loadDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDigest(await fetchAdminDigestPreview());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Digest konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDigest();
  }, [loadDigest]);

  const summary = useMemo(() => {
    if (!digest) return [];
    return [
      { label: 'Meldungen', value: digest.summary.feedCount },
      { label: 'Events', value: digest.summary.eventCount },
      { label: 'Termine', value: digest.summary.calendarCount },
      { label: 'Müll', value: digest.summary.trashCount }
    ];
  }, [digest]);

  const recipients = useMemo(() => {
    if (!digest) return [];
    return [
      { label: 'Empfänger aktiv', value: digest.recipients.active },
      { label: 'Digest aus', value: digest.recipients.disabled },
      { label: 'Ohne E-Mail', value: digest.recipients.withoutEmail },
      { label: 'Nutzer gesamt', value: digest.recipients.total }
    ];
  }, [digest]);

  async function handleSendTest() {
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const result = await sendAdminDigestTest();
      setDigest(result.digest);
      setMessage(`Test-Digest wurde an ${result.sentTo} gesendet.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test-Digest konnte nicht gesendet werden.');
    } finally {
      setSending(false);
    }
  }

  async function handleSendAll() {
    setSendingAll(true);
    setMessage(null);
    setError(null);
    try {
      const result = await sendAdminDigestToAll();
      setMessage(
        `Wochenblick ${result.weekKey}: ${result.sent} gesendet, ${result.skipped} übersprungen, ${result.failed} fehlgeschlagen.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wochenblick konnte nicht versendet werden.');
    } finally {
      setSendingAll(false);
      setConfirmSendAllOpen(false);
    }
  }

  if (error && !digest) {
    return (
      <div className="admin-digest-panel">
        <AdminEmptyState>{error}</AdminEmptyState>
        <Button type="button" variant="ghost" onClick={loadDigest}>Erneut laden</Button>
      </div>
    );
  }

  if (!digest) {
    return <AdminEmptyState>{loading ? 'Digest wird vorbereitet …' : 'Digest noch nicht geladen.'}</AdminEmptyState>;
  }

  return (
    <div className="admin-digest-panel">
      <div className="admin-digest-toolbar">
        <div>
          <strong>{digest.headline}</strong>
          <span>{digest.intro} · {digest.rangeLabel} · Stand {formatDate(digest.generatedAt)}</span>
        </div>
        <div className="admin-digest-actions">
          <Button type="button" variant="ghost" onClick={loadDigest} disabled={loading}>
            {loading ? 'Lädt …' : 'Vorschau aktualisieren'}
          </Button>
          <Button type="button" onClick={handleSendTest} disabled={sending}>
            {sending ? 'Sendet …' : 'Test an mich senden'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmSendAllOpen(true)} disabled={sendingAll}>
            {sendingAll ? 'Sendet …' : 'An alle senden'}
          </Button>
        </div>
      </div>

      <div className="admin-digest-summary">
        {summary.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="admin-digest-recipient-summary" aria-label="Digest-Empfänger">
        {recipients.map((item) => (
          <span key={item.label}>
            <strong>{item.value}</strong> {item.label}
          </span>
        ))}
      </div>

      {message && <p className="admin-rollout-message">{message}</p>}
      {error && <p className="admin-rollout-message">{error}</p>}

      {digest.highlights.length > 0 && (
        <article className="admin-digest-highlights">
          <h3>Diese Woche wichtig</h3>
          <ul>
            {digest.highlights.map((item) => (
              <li key={item.id} data-tone={item.tone ?? 'feed'}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </div>
                {item.detail && <p>{item.detail}</p>}
              </li>
            ))}
          </ul>
        </article>
      )}

      <div className="admin-digest-sections">
        {digest.sections.map((section) => (
          <article key={section.title} className="admin-digest-section">
            <h3>{section.title}</h3>
            {section.items.length === 0 ? (
              <AdminEmptyState>{section.emptyText}</AdminEmptyState>
            ) : (
              <ul>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.meta}</span>
                    </div>
                    {item.detail && <p>{item.detail}</p>}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <article className="admin-digest-history">
        <div>
          <h3>Letzte Versandläufe</h3>
          <span>{digest.history.length} Einträge</span>
        </div>
        {digest.history.length === 0 ? (
          <AdminEmptyState>Noch kein Wochenblick versendet.</AdminEmptyState>
        ) : (
          <ul>
            {digest.history.map((run) => (
              <li key={run.id}>
                <strong>{run.displayName || run.email}</strong>
                <span>{run.weekKey} · {formatDate(run.sentAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
      <ConfirmDialog
        open={confirmSendAllOpen}
        title="Wochenblick senden?"
        description={`Der Digest wird an ${digest.recipients.active} aktive Empfänger gesendet. ${digest.recipients.disabled} haben ihn deaktiviert, ${digest.recipients.withoutEmail} haben keine E-Mail-Adresse. Bereits versendete Empfänger dieser Woche werden übersprungen.`}
        confirmLabel="Jetzt senden"
        loading={sendingAll}
        onConfirm={handleSendAll}
        onCancel={() => setConfirmSendAllOpen(false)}
      />
    </div>
  );
}
