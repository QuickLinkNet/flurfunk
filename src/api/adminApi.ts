import { apiRequest } from './client';
import type { AdminCalendarEntry, AdminEvent, AdminFeedItem, AdminHousehold, AdminUser } from '../types/admin';
import type { HouseholdInvitePerson } from '../types/invite';
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

export function deleteAdminHousehold(id: number) {
  return apiRequest<null>(`/admin/households/${id}`, { method: 'DELETE' });
}

export function fetchAdminUsers() {
  return apiRequest<AdminUser[]>('/admin/users');
}

export function updateAdminUserRole(id: number, role: UserRole) {
  return apiRequest<null>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
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
