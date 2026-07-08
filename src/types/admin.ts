import type { UserRole } from './user';

export interface AdminMember {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  householdId: number | null;
  lastLoginAt: string | null;
}

export interface AdminChild {
  id: number;
  name: string;
  currentLocation: string;
}

export interface AdminPet {
  id: number;
  name: string;
  type: string;
}

export interface AdminHousehold {
  id: number;
  name: string;
  addressLine: string;
  streetName: string;
  statusEmoji: string;
  statusLabel: string;
  createdAt: string;
  members: AdminMember[];
  children: AdminChild[];
  pets: AdminPet[];
}

export interface AdminUser extends AdminMember {
  householdName: string | null;
}

export interface AdminFeedItem {
  id: number;
  householdName: string;
  type: string;
  message: string | null;
  visibility: string;
  createdAt: string;
}

export interface AdminEvent {
  id: number;
  title: string;
  type: string;
  creatorHouseholdName: string;
  startsAt: string;
  visibility: string;
  rsvpCounts: { yes: number; maybe: number; no: number };
}

export interface AdminCalendarEntry {
  id: number;
  type: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
}
