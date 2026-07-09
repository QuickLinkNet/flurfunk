import { apiRequest } from './client';
import type { InvitePreview } from '../types/invite';

export function fetchInvitePreview(code: string) {
  return apiRequest<InvitePreview>(`/invites/${code}`);
}
