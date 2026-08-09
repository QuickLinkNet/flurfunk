import { useEffect, useState } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { fetchAdminStreetInvite, regenerateAdminStreetInvite } from '../../api/adminApi';

function joinUrl(token: string): string {
  return `${window.location.origin}/apps/neighborhood/beitreten/${token}`;
}

function joinMessage(link: string): string {
  return [
    'Hallo!',
    '',
    'Ihr seid zu Flurfunk eingeladen, dem geschützten Nachbarschaftsbereich unserer Straße.',
    `Los geht's hier: ${link}`,
    '',
    'Wichtig: Bitte nur EINE Person pro Familie legt die Familie neu an. Alle anderen aus derselben',
    'Familie wählen dort "Meine Familie ist schon dabei" und schließen sich an - sonst entstehen',
    'aus Versehen zwei Familien-Einträge für euch.',
    '',
    'Tipp fürs iPhone: Nach dem Öffnen über "Zum Home-Bildschirm hinzufügen" installieren, sonst',
    'kommen keine Benachrichtigungen an.'
  ].join('\n');
}

export function AdminStreetInvitePanel() {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchAdminStreetInvite()
      .then((result) => setToken(result.token))
      .catch(() => setMessage('Link konnte nicht geladen werden.'));
  }, []);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} kopiert.`);
    } catch {
      setMessage('Kopieren fehlgeschlagen.');
    }
  }

  async function confirmRegenerate() {
    setIsRegenerating(true);
    try {
      const result = await regenerateAdminStreetInvite();
      setToken(result.token);
      setMessage('Neuer Link erzeugt. Der alte Link funktioniert nicht mehr.');
      setConfirmOpen(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erneuern fehlgeschlagen.');
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div className="compact-manager">
      <p>
        Wer diesen Link öffnet, kann sich selbst eine neue Familie anlegen oder einer bestehenden
        beitreten - ohne dass du vorher einen Code pro Person erzeugen musst. Zwei Haushalte mit
        gleichem Namen oder gleicher Adresse werden automatisch blockiert. Bitte trotzdem lieber den
        fertigen Text unten verschicken statt nur den nackten Link - sonst ist bei mehreren Personen
        aus derselben Familie nicht klar, dass nur einer die Familie neu anlegen soll.
      </p>
      {token && (
        <div className="compact-form">
          <Input readOnly value={joinUrl(token)} onFocus={(event) => event.target.select()} />
        </div>
      )}
      <div className="md-card-actions">
        <Button type="button" variant="ghost" onClick={() => token && copy(joinUrl(token), 'Link')} disabled={!token}>
          Nur Link kopieren
        </Button>
        <Button type="button" onClick={() => token && copy(joinMessage(joinUrl(token)), 'Einladungstext')} disabled={!token}>
          Einladungstext kopieren
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirmOpen(true)} disabled={!token}>
          Link erneuern
        </Button>
      </div>
      {message && <p style={{ margin: 0, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>{message}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Link erneuern?"
        description="Der bisherige Link funktioniert danach nicht mehr. Schon geteilte Links werden ungültig."
        confirmLabel="Erneuern"
        loading={isRegenerating}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmRegenerate}
      />
    </div>
  );
}
