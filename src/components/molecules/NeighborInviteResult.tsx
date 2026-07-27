import { useMemo, useState } from 'react';
import { Button } from '../atoms/Button';
import { inviteMessage, inviteUrl } from './InviteCodeRow';
import type { HouseholdInvitePerson } from '../../types/invite';

interface Props {
  invite: HouseholdInvitePerson;
}

// Schlanke Variante von InviteCodeRow für den Nachbar-Invite-Flow: keine
// serverseitige E-Mail-Versand-Aktion (die ist Admin-only), nur Kopieren
// und Mailprogramm/WhatsApp per Teilen-Link.
export function NeighborInviteResult({ invite }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const link = useMemo(() => inviteUrl(invite.code), [invite.code]);
  const message = useMemo(() => inviteMessage(invite, link), [invite, link]);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} kopiert.`);
      window.setTimeout(() => setNotice(null), 1800);
    } catch {
      setNotice('Kopieren fehlgeschlagen.');
    }
  }

  return (
    <div className="admin-invite-row">
      <div className="admin-invite-row-main">
        <div className="admin-invite-row-title">
          <strong>{invite.firstName} {invite.lastName}</strong>
        </div>
        <code>{invite.code}</code>
        <p>{link}</p>
        {notice && <p className="admin-invite-row-message">{notice}</p>}
      </div>
      <div className="admin-invite-row-actions">
        <Button type="button" variant="ghost" onClick={() => copy(invite.code, 'Code')}>
          Code kopieren
        </Button>
        <Button type="button" variant="ghost" onClick={() => copy(link, 'Link')}>
          Link kopieren
        </Button>
        <Button type="button" variant="ghost" onClick={() => copy(message, 'Einladungstext')}>
          Text kopieren
        </Button>
      </div>
    </div>
  );
}
