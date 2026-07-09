import { apiRequest } from './client';
import type { FeatureFlags } from '../types/featureFlags';

export function fetchFeatureFlags() {
  return apiRequest<FeatureFlags>('/feature-flags');
}

export function updateFeatureFlags(patch: Partial<FeatureFlags>) {
  return apiRequest<FeatureFlags>('/admin/feature-flags', { method: 'PUT', body: JSON.stringify(patch) });
}
