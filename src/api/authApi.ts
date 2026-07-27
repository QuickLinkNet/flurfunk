import { apiRequest } from './client';
import type { OnboardingStep } from '../types/onboarding';
import type { User } from '../types/user';

export function login(email: string, password: string, remember = true) {
  return apiRequest<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, remember }) });
}

export function logout() {
  return apiRequest<null>('/auth/logout', { method: 'POST' });
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export function confirmPasswordReset(token: string, password: string) {
  return apiRequest<{ message: string }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  });
}

export function fetchCurrentUser() {
  return apiRequest<User>('/auth/me');
}

export function updateProfile(displayName: string, avatarUrl?: string | null) {
  return apiRequest<User>('/auth/me/profile', { method: 'PUT', body: JSON.stringify({ displayName, avatarUrl }) });
}

export function updatePassword(currentPassword: string, newPassword: string) {
  return apiRequest<User>('/auth/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
}

export function updateDigestPreference(weeklyDigestEnabled: boolean) {
  return apiRequest<User>('/auth/me/digest-preference', {
    method: 'PUT',
    body: JSON.stringify({ weeklyDigestEnabled })
  });
}

export function deleteMe() {
  return apiRequest<null>('/auth/me', { method: 'DELETE' });
}

export function exportMe() {
  return apiRequest<Record<string, unknown>>('/auth/me/export');
}

export function completeOnboarding() {
  return apiRequest<User>('/auth/onboarding/complete', { method: 'POST' });
}

export function saveOnboardingProgress(step: OnboardingStep) {
  return apiRequest<User>('/auth/onboarding/progress', { method: 'POST', body: JSON.stringify({ step }) });
}

interface RegisterInput {
  code: string;
  email: string;
  password: string;
}

export function register(input: RegisterInput) {
  return apiRequest<User>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}
