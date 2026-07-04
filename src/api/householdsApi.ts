import { apiRequest } from './client';
import type { Household } from '../types/household';

export function fetchVisibleHouseholds() {
  return apiRequest<Household[]>('/households');
}

export function fetchMyHousehold() {
  return apiRequest<Household>('/households/me');
}

export function updateMyHousehold(patch: Partial<Household>) {
  return apiRequest<Household>('/households/me', { method: 'PUT', body: JSON.stringify(patch) });
}
