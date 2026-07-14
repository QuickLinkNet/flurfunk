import type { UserRole } from './user';
import type { HouseholdInvitePerson } from './invite';
import type { OnboardingStep } from './onboarding';

export type AdminTab = 'overview' | 'households' | 'invites' | 'users' | 'content' | 'calendar' | 'system';

export interface AdminMember {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  householdId: number | null;
  lastLoginAt: string | null;
  onboardingCompletedAt: string | null;
  onboardingCurrentStep: OnboardingStep;
  pushSubscribed: boolean;
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
  avatarKey: string;
  streetName: string;
  statusEmoji: string;
  statusLabel: string;
  createdAt: string;
  members: AdminMember[];
  children: AdminChild[];
  pets: AdminPet[];
  invites: HouseholdInvitePerson[];
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
  expiresAt: string | null;
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

export interface AdminNotice {
  id: number;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
}
