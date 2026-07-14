import { useMemo, useState } from 'react';
import { Button } from '../atoms/Button';
import { StatusPill } from '../atoms/StatusPill';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Props {
  invite: HouseholdInvitePerson;
  onRevoke?: (id: number) => void;
}

function inviteUrl(code: string): string {
  return `${window.location.origin}/apps/neighborhood/registrieren/${code}`;
}

function inviteMessage(invite: HouseholdInvitePerson, link: string): string {
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

export function InviteCodeRow({ invite, onRevoke }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const link = useMemo(() => inviteUrl(invite.code), [invite.code]);
  const message = useMemo(() => inviteMessage(invite, link), [invite, link]);
  const isUsed = Boolean(invite.usedAt);
  const isRevoked = Boolean(invite.revokedAt);
  const isInactive = isUsed || isRevoked;

  async function copy(value: string, label: string) {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
      setCopyError('Kopieren fehlgeschlagen.');
    }
  }

  return (
    <div
      className="md-invite-row"
      style={{
        padding: 'var(--md-space-3)',
        borderRadius: 'var(--md-radius-control)',
        border: '1px solid var(--md-color-border)',
        background: isInactive ? 'var(--md-color-surface-variant)' : 'var(--md-color-surface)',
        opacity: isInactive ? 0.78 : 1
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--md-space-2)', alignItems: 'center' }}>
          <strong style={{ fontSize: 'var(--md-font-size-base)' }}>
            {invite.firstName} {invite.lastName}
          </strong>
          <StatusPill label={isUsed ? 'eingelöst' : isRevoked ? 'widerrufen' : 'offen'} tone={isUsed ? 'success' : 'neutral'} />
        </div>
        <code
          style={{
            display: 'block',
            marginTop: 'var(--md-space-2)',
            fontSize: 'var(--md-font-size-lg)',
            fontWeight: 'var(--md-font-weight-bold)',
            letterSpacing: 0,
            wordBreak: 'break-word'
          }}
        >
          {invite.code}
        </code>
        <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-xs)', color: 'var(--md-color-on-surface-variant)', wordBreak: 'break-word' }}>
          {isUsed ? 'Dieser Code wurde bereits verwendet.' : isRevoked ? 'Dieser Code wurde widerrufen.' : link}
        </p>
        {(copied || copyError) && (
          <p style={{ margin: 'var(--md-space-1) 0 0', fontSize: 'var(--md-font-size-sm)', color: copyError ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
            {copyError ?? `${copied} kopiert.`}
          </p>
        )}
      </div>
      <div className="md-card-actions">
        <Button type="button" variant="ghost" onClick={() => copy(invite.code, 'Code')} disabled={isInactive}>
          Code
        </Button>
        <Button type="button" variant="ghost" onClick={() => copy(link, 'Link')} disabled={isInactive}>
          Link
        </Button>
        <Button type="button" variant="ghost" onClick={() => copy(message, 'Einladung')} disabled={isInactive}>
          Einladung
        </Button>
        {onRevoke && (
          <Button type="button" variant="ghost" onClick={() => onRevoke(invite.id)} disabled={isInactive}>
            Widerrufen
          </Button>
        )}
      </div>
    </div>
  );
}
