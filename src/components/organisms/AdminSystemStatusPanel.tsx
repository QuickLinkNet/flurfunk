import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../atoms/Button';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { fetchAdminSystemStatus } from '../../api/adminApi';
import { FEATURE_LABELS } from '../../types/featureFlags';
import type { AdminSystemStatus } from '../../types/admin';
import type { FeatureKey } from '../../types/featureFlags';

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`admin-status-pill ${ok ? 'admin-status-pill--ok' : 'admin-status-pill--warn'}`}>
      {label}
    </span>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Noch nicht angewendet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
}

export function AdminSystemStatusPanel() {
  const [status, setStatus] = useState<AdminSystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await fetchAdminSystemStatus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Systemstatus konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const enabledFeatureCount = useMemo(() => {
    if (!status) return 0;
    return Object.values(status.featureFlags).filter(Boolean).length;
  }, [status]);

  if (error) {
    return (
      <div className="admin-system-status">
        <AdminEmptyState>{error}</AdminEmptyState>
        <Button type="button" variant="ghost" onClick={loadStatus}>Erneut prüfen</Button>
      </div>
    );
  }

  if (!status) {
    return <AdminEmptyState>{loading ? 'Systemstatus wird geprüft ...' : 'Systemstatus noch nicht geladen.'}</AdminEmptyState>;
  }

  const allPwaFilesExist = status.pwa.every((item) => item.exists);
  const pushConfigured = status.push.vapidConfigured;
  const migrationsClean = status.migrations.pending === 0;

  return (
    <div className="admin-system-status">
      <div className="admin-system-toolbar">
        <div>
          <strong>Letzter Check</strong>
          <span>{formatDate(status.serverTime)}</span>
        </div>
        <Button type="button" variant="ghost" onClick={loadStatus} disabled={loading}>
          {loading ? 'Prüft ...' : 'Aktualisieren'}
        </Button>
      </div>

      <div className="admin-system-grid">
        <article className="admin-system-card">
          <div className="admin-system-card-header">
            <strong>Datenbank</strong>
            <StatusPill ok={migrationsClean && status.database.foreignKeys} label={migrationsClean ? 'Ok' : 'Offen'} />
          </div>
          <dl>
            <div><dt>Treiber</dt><dd>{status.database.driver}</dd></div>
            <div><dt>Migrationen</dt><dd>{status.migrations.applied}/{status.migrations.total}</dd></div>
            <div><dt>Letzte Migration</dt><dd>{status.migrations.latestApplied?.filename ?? 'Keine'}</dd></div>
          </dl>
          {status.migrations.pendingFiles.length > 0 && (
            <p>Offen: {status.migrations.pendingFiles.join(', ')}</p>
          )}
        </article>

        <article className="admin-system-card">
          <div className="admin-system-card-header">
            <strong>PWA</strong>
            <StatusPill ok={allPwaFilesExist} label={allPwaFilesExist ? 'Bereit' : 'Prüfen'} />
          </div>
          <ul className="admin-system-checklist">
            {status.pwa.map((item) => (
              <li key={item.path}>
                <span>{item.label}</span>
                <StatusPill ok={item.exists} label={item.exists ? 'Ok' : 'Fehlt'} />
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-system-card">
          <div className="admin-system-card-header">
            <strong>Push</strong>
            <StatusPill ok={pushConfigured} label={pushConfigured ? 'Konfiguriert' : 'Unvollständig'} />
          </div>
          <dl>
            <div><dt>Abos</dt><dd>{status.push.subscriptions}</dd></div>
            <div><dt>VAPID-Keysets</dt><dd>{status.push.vapidKeys}</dd></div>
            <div><dt>Status</dt><dd>{status.push.vapidConfigured ? 'Bereit' : 'Noch nicht erzeugt'}</dd></div>
          </dl>
        </article>

        <article className="admin-system-card">
          <div className="admin-system-card-header">
            <strong>Feature-Flags</strong>
            <StatusPill ok={enabledFeatureCount > 0} label={`${enabledFeatureCount} aktiv`} />
          </div>
          <ul className="admin-system-checklist">
            {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((key) => (
              <li key={key}>
                <span>{FEATURE_LABELS[key]}</span>
                <StatusPill ok={status.featureFlags[key]} label={status.featureFlags[key] ? 'An' : 'Aus'} />
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
