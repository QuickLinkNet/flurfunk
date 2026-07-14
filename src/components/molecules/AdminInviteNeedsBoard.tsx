import { Button } from '../atoms/Button';
import type { AdminHousehold } from '../../types/admin';
import type { InviteRolloutFilter } from '../../types/adminInviteRollout';
import type { HouseholdInvitePerson } from '../../types/invite';
import { onboardingFollowUpLabel } from '../../utils/onboardingStatus';

interface Props {
  households: AdminHousehold[];
  onShowStatus: (filter: InviteRolloutFilter) => void;
}

interface NeedItem {
  id: number;
  name: string;
  householdName: string;
  detail?: string;
}

interface NeedGroup {
  title: string;
  description: string;
  items: NeedItem[];
  actionLabel: string;
  filter: InviteRolloutFilter;
}

function inviteName(invite: HouseholdInvitePerson): string {
  return `${invite.firstName} ${invite.lastName}`;
}

function toNeedItem(invite: HouseholdInvitePerson, household: AdminHousehold): NeedItem {
  return {
    id: invite.id,
    name: inviteName(invite),
    householdName: household.name
  };
}

function collectNeedGroups(households: AdminHousehold[]): NeedGroup[] {
  const activeInvites = households.flatMap((household) => (
    household.invites
      .filter((invite) => !invite.revokedAt)
      .map((invite) => ({ household, invite }))
  ));

  return [
    {
      title: 'Noch nicht registriert',
      description: 'Einladung wurde noch nicht eingelöst.',
      items: activeInvites
        .filter(({ invite }) => !invite.usedAt)
        .map(({ household, invite }) => toNeedItem(invite, household)),
      actionLabel: 'Offene anzeigen',
      filter: 'open'
    },
    {
      title: 'Onboarding offen',
      description: 'Account existiert, Startschritte fehlen noch.',
      items: activeInvites
        .filter(({ invite }) => invite.usedByUser && !invite.usedByUser.onboardingCompletedAt)
        .map(({ household, invite }) => ({
          ...toNeedItem(invite, household),
          detail: `Step: ${onboardingFollowUpLabel(invite.usedByUser?.onboardingCurrentStep)}`
        })),
      actionLabel: 'Onboarding anzeigen',
      filter: 'onboarding'
    },
    {
      title: 'Push offen',
      description: 'Push ist noch nicht aktiv oder nicht gespeichert.',
      items: activeInvites
        .filter(({ invite }) => invite.usedByUser && !invite.usedByUser.pushSubscribed)
        .map(({ household, invite }) => toNeedItem(invite, household)),
      actionLabel: 'Push anzeigen',
      filter: 'push'
    },
    {
      title: 'Startklar',
      description: 'Registrierung, Onboarding und Push sind erledigt.',
      items: activeInvites
        .filter(({ invite }) => invite.usedByUser?.onboardingCompletedAt && invite.usedByUser.pushSubscribed)
        .map(({ household, invite }) => toNeedItem(invite, household)),
      actionLabel: 'Startklare anzeigen',
      filter: 'ready'
    }
  ];
}

export function AdminInviteNeedsBoard({ households, onShowStatus }: Props) {
  const groups = collectNeedGroups(households);

  return (
    <div className="admin-needs-board">
      {groups.map((group) => (
        <article key={group.title} className="admin-needs-card">
          <div>
            <strong>{group.items.length}</strong>
            <span>{group.title}</span>
          </div>
          <p>{group.description}</p>
          {group.items.length > 0 ? (
            <ul>
              {group.items.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <small>{item.detail ? `${item.householdName} · ${item.detail}` : item.householdName}</small>
                </li>
              ))}
              {group.items.length > 5 && <li>+ {group.items.length - 5} weitere</li>}
            </ul>
          ) : (
            <p className="admin-needs-empty">Nichts offen.</p>
          )}
          <Button type="button" variant="ghost" onClick={() => onShowStatus(group.filter)}>
            {group.actionLabel}
          </Button>
        </article>
      ))}
    </div>
  );
}
