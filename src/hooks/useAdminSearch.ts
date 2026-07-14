import { useState } from 'react';
import type { AdminHousehold, AdminUser } from '../types/admin';

interface Options {
  households: AdminHousehold[];
  users: AdminUser[];
}

function includesQuery(query: string, ...values: Array<string | null | undefined>): boolean {
  if (!query) return true;
  return values.some((value) => value?.toLowerCase().includes(query));
}

export function useAdminSearch({ households, users }: Options) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const openOnboardingCount = users.filter((user) => !user.onboardingCompletedAt).length;

  const filteredHouseholds = households.filter((household) => (
    includesQuery(
      query,
      household.name,
      household.addressLine,
      household.streetName,
      ...household.members.flatMap((member) => [member.displayName, member.email]),
      ...household.invites.flatMap((invite) => [invite.code, invite.firstName, invite.lastName])
    )
  ));

  const filteredUsers = users.filter((user) => (
    includesQuery(query, user.displayName, user.email, user.householdName, user.role)
  ));

  return {
    filteredHouseholds,
    filteredUsers,
    openOnboardingCount,
    search,
    setSearch
  };
}
