import { StatusPill } from '../atoms/StatusPill';
import type { AdminHousehold } from '../../types/admin';

interface Props {
  household: AdminHousehold;
}

function listNames(items: string[]): string {
  return items.length > 0 ? items.join(', ') : 'keine';
}

export function AdminHouseholdMeta({ household }: Props) {
  const memberCount = household.members.length;
  const completedOnboarding = household.members.filter((member) => member.onboardingCompletedAt).length;
  const activePush = household.members.filter((member) => member.pushSubscribed).length;

  return (
    <div style={{ marginTop: 'var(--md-space-3)', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
      <div style={{ display: 'flex', gap: 'var(--md-space-2)', flexWrap: 'wrap', marginBottom: 'var(--md-space-2)' }}>
        <StatusPill label={`${memberCount} Mitglied${memberCount === 1 ? '' : 'er'}`} />
        <StatusPill
          label={`Onboarding ${completedOnboarding}/${memberCount}`}
          tone={memberCount > 0 && completedOnboarding === memberCount ? 'success' : 'neutral'}
        />
        <StatusPill
          label={`Push ${activePush}/${memberCount}`}
          tone={memberCount > 0 && activePush === memberCount ? 'success' : 'neutral'}
        />
      </div>
      <p style={{ margin: 0 }}>Mitglieder: {listNames(household.members.map((member) => `${member.displayName} (${member.role})`))}</p>
      <p style={{ margin: 'var(--md-space-1) 0 0' }}>
        Kinder: {listNames(household.children.map((child) => `${child.name} (${child.currentLocation})`))}
      </p>
      <p style={{ margin: 'var(--md-space-1) 0 0' }}>
        Haustiere: {listNames(household.pets.map((pet) => `${pet.name} (${pet.type})`))}
      </p>
    </div>
  );
}
