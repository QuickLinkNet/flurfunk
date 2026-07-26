import { useMemo, useState } from 'react';
import { Button } from '../atoms/Button';
import { StatusPill } from '../atoms/StatusPill';
import { sendAdminInviteEmail } from '../../api/adminApi';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Props {
  invite: HouseholdInvitePerson;
  onEmailSent?: (invite: HouseholdInvitePerson) => void;
  onRevoke?: (id: number) => void;
}

export function inviteUrl(code: string): string {
  return `${window.location.origin}/apps/neighborhood/registrieren/${code}`;
}

export function inviteMessage(invite: HouseholdInvitePerson, link: string): string {
  return [
    `Hallo ${invite.firstName},`,
    '',
    'du bist zu Flurfunk eingeladen, dem geschützten Nachbarschaftsbereich unserer Straße.',
    `Dein Einladungscode: ${invite.code}`,
    `Direkt beitreten: ${link}`,
    '',
    'Nach der Registrierung kannst du euren Haushalt einrichten, Push aktivieren und wichtige Infos aus der Straße sehen.'
  ].join('\n');
}

function mailtoUrl(invite: HouseholdInvitePerson, message: string): string {
  const subject = encodeURIComponent('Einladung zu Flurfunk');
  const body = encodeURIComponent(message);
  return `mailto:${invite.email}?subject=${subject}&body=${body}`;
}

function formatInviteDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function inviteState(invite: HouseholdInvitePerson) {
  if (invite.usedAt) return { label: 'eingelöst', tone: 'success' as const };
  if (invite.revokedAt) return { label: 'widerrufen', tone: 'neutral' as const };
  if (invite.emailLastSentAt) return { label: 'versendet', tone: 'success' as const };
  return { label: 'offen', tone: 'neutral' as const };
}

export function InviteCodeRow({ invite, onEmailSent, onRevoke }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const link = useMemo(() => inviteUrl(invite.code), [invite.code]);
  const message = useMemo(() => inviteMessage(invite, link), [invite, link]);
  const mailto = useMemo(() => invite.email ? mailtoUrl(invite, message) : null, [invite, message]);
  const isUsed = Boolean(invite.usedAt);
  const isRevoked = Boolean(invite.revokedAt);
  const isInactive = isUsed || isRevoked;
  const state = inviteState(invite);
  const createdAtLabel = formatInviteDate(invite.createdAt);
  const lastSentAtLabel = formatInviteDate(invite.emailLastSentAt);

  async function copy(value: string, label: string) {
    setIsError(false);
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} kopiert.`);
      window.setTimeout(() => setNotice(null), 1800);
    } catch {
      setIsError(true);
      setNotice('Kopieren fehlgeschlagen.');
    }
  }

  async function sendEmail() {
    setIsError(false);
    setIsSendingEmail(true);
    try {
      const updatedInvite = await sendAdminInviteEmail(invite.id);
      setNotice('E-Mail versendet.');
      window.setTimeout(() => setNotice(null), 2200);
      onEmailSent?.(updatedInvite);
    } catch (err) {
      setIsError(true);
      setNotice(err instanceof Error ? err.message : 'E-Mail konnte nicht versendet werden.');
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <div className="admin-invite-row" data-inactive={isInactive}>
      <div className="admin-invite-row-main">
        <div className="admin-invite-row-title">
          <strong>{invite.firstName} {invite.lastName}</strong>
          <StatusPill label={state.label} tone={state.tone} />
          {invite.email ? <StatusPill label="E-Mail hinterlegt" tone="neutral" /> : <StatusPill label="ohne E-Mail" tone="neutral" />}
        </div>

        <code>{invite.code}</code>
        <p>{isUsed ? 'Dieser Code wurde bereits verwendet.' : isRevoked ? 'Dieser Code wurde widerrufen.' : link}</p>

        <dl className="admin-invite-row-meta">
          {invite.email && (
            <div>
              <dt>E-Mail</dt>
              <dd>{invite.email}</dd>
            </div>
          )}
          {createdAtLabel && (
            <div>
              <dt>Erstellt</dt>
              <dd>{createdAtLabel}</dd>
            </div>
          )}
          {lastSentAtLabel && (
            <div>
              <dt>Zuletzt gesendet</dt>
              <dd>{lastSentAtLabel}{invite.emailSendCount > 1 ? ` (${invite.emailSendCount}x)` : ''}</dd>
            </div>
          )}
          {invite.usedByUser && (
            <div>
              <dt>Genutzt von</dt>
              <dd>{invite.usedByUser.displayName} · {invite.usedByUser.email}</dd>
            </div>
          )}
        </dl>

        {notice && <p className="admin-invite-row-message" data-error={isError}>{notice}</p>}
      </div>

      <div className="admin-invite-row-actions">
        <Button type="button" variant="ghost" onClick={() => copy(invite.code, 'Code')} disabled={isInactive}>
          Code kopieren
        </Button>
        <Button type="button" variant="ghost" onClick={() => copy(link, 'Link')} disabled={isInactive}>
          Link kopieren
        </Button>
        <Button type="button" variant="ghost" onClick={() => copy(message, 'Einladungstext')} disabled={isInactive}>
          Text kopieren
        </Button>
        {invite.email && (
          <Button type="button" variant="ghost" onClick={sendEmail} disabled={isInactive || isSendingEmail}>
            {isSendingEmail ? 'Sendet...' : invite.emailLastSentAt ? 'Erneut senden' : 'E-Mail senden'}
          </Button>
        )}
        {mailto && (
          <Button type="button" variant="ghost" onClick={() => { window.location.href = mailto; }} disabled={isInactive || isSendingEmail}>
            Mailprogramm
          </Button>
        )}
        {onRevoke && (
          <Button type="button" variant="ghost" onClick={() => onRevoke(invite.id)} disabled={isInactive}>
            Widerrufen
          </Button>
        )}
      </div>
    </div>
  );
}
