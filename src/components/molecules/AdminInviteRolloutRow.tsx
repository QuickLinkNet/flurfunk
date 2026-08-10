import { Button } from '../atoms/Button';
import { StatusPill } from '../atoms/StatusPill';
import { InviteCodeRow, inviteUrl } from './InviteCodeRow';
import type { HouseholdInvitePerson } from '../../types/invite';
import { onboardingFollowUpLabel, onboardingStatusLabel } from '../../utils/onboardingStatus';

interface Props {
  invite: HouseholdInvitePerson;
  actionMessage?: string;
  isPushBusy: boolean;
  onCopyFollowUp: (invite: HouseholdInvitePerson) => void;
  onEmailSent: (invite: HouseholdInvitePerson) => void;
  onPushTest: (invite: HouseholdInvitePerson) => void;
  onRevoke: (invite: HouseholdInvitePerson) => void;
  onPurge: (invite: HouseholdInvitePerson) => void;
}

export function missingInviteSteps(invite: HouseholdInvitePerson): string[] {
  if (!invite.usedAt) return ['Registrierung'];
  if (!invite.usedByUser) return ['Nutzer prüfen'];

  const steps: string[] = [];
  if (!invite.usedByUser.onboardingCompletedAt) {
    steps.push(`Onboarding (${onboardingFollowUpLabel(invite.usedByUser.onboardingCurrentStep)})`);
  }
  if (!invite.usedByUser.pushSubscribed) steps.push('Push aktivieren');
  return steps;
}

export function inviteFollowUpMessage(invite: HouseholdInvitePerson): string {
  const name = invite.firstName;
  if (!invite.usedAt) {
    return [
      `Hallo ${name},`,
      '',
      'hier ist nochmal deine Einladung zu Flurfunk:',
      inviteUrl(invite.code),
      '',
      `Dein Einladungscode: ${invite.code}`
    ].join('\n');
  }

  if (!invite.usedByUser) {
    return [
      `Hallo ${name},`,
      '',
      'dein Einladungscode wurde eingelöst, aber der zugehörige Nutzer konnte nicht mehr gefunden werden.',
      'Melde dich bitte kurz, damit wir deinen Zugang prüfen können.'
    ].join('\n');
  }

  const messages: string[] = [];
  if (!invite.usedByUser.onboardingCompletedAt) {
    messages.push(`den Startschritt "${onboardingFollowUpLabel(invite.usedByUser.onboardingCurrentStep)}" abschließen`);
  }
  if (!invite.usedByUser.pushSubscribed) {
    messages.push('Push-Benachrichtigungen aktivieren');
  }
  const steps = messages.join(' und ');

  return [
    `Hallo ${name},`,
    '',
    `dein Flurfunk-Zugang ist schon angelegt. Bitte erledige noch: ${steps}.`,
    '',
    'Danach bist du in der Nachbarschafts-App startklar.'
  ].join('\n');
}

export function AdminInviteRolloutRow({
  invite,
  actionMessage,
  isPushBusy,
  onCopyFollowUp,
  onEmailSent,
  onPushTest,
  onRevoke,
  onPurge
}: Props) {
  const steps = missingInviteSteps(invite);

  return (
    <div className="admin-rollout-invite">
      <InviteCodeRow invite={invite} onEmailSent={onEmailSent} onRevoke={() => onRevoke(invite)} onPurge={() => onPurge(invite)} />
      {!invite.revokedAt && steps.length > 0 && (
        <div className="admin-rollout-next-steps">
          <strong>Fehlt noch:</strong>
          <span>{steps.join(', ')}</span>
        </div>
      )}
      {invite.usedByUser && (
        <div className="admin-rollout-progress">
          <StatusPill label="Registriert" tone="success" />
          <StatusPill
            label={onboardingStatusLabel(invite.usedByUser.onboardingCompletedAt, invite.usedByUser.onboardingCurrentStep)}
            tone={invite.usedByUser.onboardingCompletedAt ? 'success' : 'neutral'}
          />
          <StatusPill
            label={invite.usedByUser.pushSubscribed ? 'Push aktiv' : 'Push offen'}
            tone={invite.usedByUser.pushSubscribed ? 'success' : 'neutral'}
          />
          <span>{invite.usedByUser.displayName} · {invite.usedByUser.email}</span>
        </div>
      )}
      {invite.usedAt && !invite.usedByUser && (
        <div className="admin-rollout-progress">
          <StatusPill label="Registriert" tone="success" />
          <StatusPill label="Nutzer nicht mehr vorhanden" />
        </div>
      )}
      {!invite.revokedAt && steps.length > 0 && (
        <div className="admin-rollout-actions">
          <Button type="button" variant="ghost" onClick={() => onCopyFollowUp(invite)}>
            Nachfassen kopieren
          </Button>
          {invite.usedByUser && (
            <Button type="button" variant="ghost" onClick={() => onPushTest(invite)} disabled={isPushBusy}>
              {isPushBusy ? 'Sendet...' : 'Push-Test senden'}
            </Button>
          )}
        </div>
      )}
      {actionMessage && <p className="admin-rollout-message">{actionMessage}</p>}
    </div>
  );
}
