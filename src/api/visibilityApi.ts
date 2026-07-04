import { apiRequest } from './client';
import type { Visibility } from '../utils/visibility';

type VisibilityMap = Record<'status' | 'vacation' | 'children_location' | 'events', Visibility>;

export function fetchMyVisibility() {
  return apiRequest<VisibilityMap>('/households/me/visibility');
}

export function updateMyVisibility(patch: Partial<VisibilityMap>) {
  return apiRequest<VisibilityMap>('/households/me/visibility', { method: 'PUT', body: JSON.stringify(patch) });
}
