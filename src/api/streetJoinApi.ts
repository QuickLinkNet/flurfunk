import { apiRequest } from './client';
import type { StreetJoinInput, StreetJoinPreview } from '../types/streetJoin';
import type { User } from '../types/user';

export function fetchStreetJoinPreview(token: string) {
  return apiRequest<StreetJoinPreview>(`/join/${token}`);
}

export function submitStreetJoin(token: string, input: StreetJoinInput) {
  return apiRequest<User>(`/join/${token}`, { method: 'POST', body: JSON.stringify(input) });
}
