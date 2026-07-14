import { apiRequest } from './client';
import type { DashboardData } from '../types/dashboard';

export function fetchDashboard() {
  return apiRequest<DashboardData>('/dashboard');
}
