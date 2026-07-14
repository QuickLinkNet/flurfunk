import { apiRequest } from './client';
import type { AdminCalendarEntry, AdminEvent, AdminFeedItem, AdminHousehold, AdminNotice, AdminUser } from '../types/admin';
import type { HouseholdInvitePerson } from '../types/invite';
import type { PushSendResult } from '../types/push';
import type { UserRole } from '../types/user';

export function fetchAdminHouseholds() {
  return apiRequest<AdminHousehold[]>('/admin/households');
}

interface NewHouseholdPerson {
  firstName: string;
  lastName: string;
}

export function createAdminHousehold(name: string, addressLine: string, people: NewHouseholdPerson[]) {
  return apiRequest<{ householdId: number; invites: HouseholdInvitePerson[] }>('/admin/households', {
    method: 'POST',
    body: JSON.stringify({ name, addressLine, people })
  });
}

export function addAdminHouseholdInvite(householdId: number, firstName: string, lastName: string) {
  return apiRequest<HouseholdInvitePerson>(`/admin/households/${householdId}/invites`, {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName })
  });
}

export function revokeAdminInvite(id: number) {
  return apiRequest<null>(`/admin/invites/${id}`, { method: 'DELETE' });
}

export function updateAdminHousehold(id: number, name: string, addressLine: string, avatarKey: string) {
  return apiRequest<null>(`/admin/households/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, addressLine, avatarKey })
  });
}

export function deleteAdminHousehold(id: number) {
  return apiRequest<null>(`/admin/households/${id}`, { method: 'DELETE' });
}

export function fetchAdminUsers() {
  return apiRequest<AdminUser[]>('/admin/users');
}

export function updateAdminUserRole(id: number, role: UserRole) {
  return apiRequest<null>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
}

export interface AdminPushTestResult extends PushSendResult {
  userId: number;
}

export function sendAdminUserPushTest(id: number) {
  return apiRequest<AdminPushTestResult>(`/admin/users/${id}/push-test`, { method: 'POST' });
}

export function fetchAdminFeed() {
  return apiRequest<AdminFeedItem[]>('/admin/feed');
}

export function deleteAdminFeedItem(id: number) {
  return apiRequest<null>(`/admin/feed/${id}`, { method: 'DELETE' });
}

export function fetchAdminEvents() {
  return apiRequest<AdminEvent[]>('/admin/events');
}

export function deleteAdminEvent(id: number) {
  return apiRequest<null>(`/admin/events/${id}`, { method: 'DELETE' });
}

export function fetchAdminCalendar() {
  return apiRequest<AdminCalendarEntry[]>('/admin/calendar');
}

export function deleteAdminCalendarEntry(id: number) {
  return apiRequest<null>(`/admin/calendar/${id}`, { method: 'DELETE' });
}

export function fetchAdminNotices() {
  return apiRequest<AdminNotice[]>('/admin/notices');
}

export function createAdminNotice(title: string, message: string) {
  return apiRequest<AdminNotice>('/admin/notices', {
    method: 'POST',
    body: JSON.stringify({ title, message })
  });
}

export function deleteAdminNotice(id: number) {
  return apiRequest<null>(`/admin/notices/${id}`, { method: 'DELETE' });
}
