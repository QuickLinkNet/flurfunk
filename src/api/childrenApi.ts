import { apiRequest } from './client';
import type { Child, ChildLocation } from '../types/child';

export function fetchChildren() {
  return apiRequest<Child[]>('/children');
}

export function createChild(name: string, birthdate?: string) {
  return apiRequest<{ id: number }>('/children', { method: 'POST', body: JSON.stringify({ name, birthdate }) });
}

export function updateChildLocation(childId: number, location: ChildLocation, note?: string) {
  return apiRequest<null>(`/children/${childId}`, { method: 'PUT', body: JSON.stringify({ location, note }) });
}
