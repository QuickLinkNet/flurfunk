import { apiRequest } from './client';
import type { Household } from '../types/household';
import type { NeighborHousehold } from '../types/neighbor';
import type { HouseholdInvitePerson } from '../types/invite';

export function fetchVisibleHouseholds() {
  return apiRequest<Household[]>('/households');
}

export function fetchNeighborHouseholds() {
  return apiRequest<NeighborHousehold[]>('/households/neighbors');
}

export function fetchMyHousehold() {
  return apiRequest<Household>('/households/me');
}

export function updateMyHousehold(patch: Partial<Household>) {
  return apiRequest<Household>('/households/me', { method: 'PUT', body: JSON.stringify(patch) });
}

export interface InviteNeighborPayload {
  name: string;
  addressLine: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export function inviteNeighbor(payload: InviteNeighborPayload) {
  return apiRequest<{ householdId: number; invite: HouseholdInvitePerson }>('/neighbors/invite', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
