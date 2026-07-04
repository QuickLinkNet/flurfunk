import { apiRequest } from './client';
import type { User } from '../types/user';

export function login(email: string, password: string) {
  return apiRequest<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function logout() {
  return apiRequest<null>('/auth/logout', { method: 'POST' });
}

export function fetchCurrentUser() {
  return apiRequest<User>('/auth/me');
}
