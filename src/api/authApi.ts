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

interface RegisterInput {
  code: string;
  email: string;
  password: string;
}

export function register(input: RegisterInput) {
  return apiRequest<User>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}
