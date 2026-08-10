import type { UserRole } from './user';
import type { HouseholdInvitePerson } from './invite';
import type { OnboardingStep } from './onboarding';
import type { FeatureFlags } from './featureFlags';
import type { PushSendResult } from './push';

export type AdminTab = 'overview' | 'households' | 'invites' | 'users' | 'content' | 'feedback' | 'calendar' | 'system';

export interface AdminMember {
  id: number;
  email: string;
  displayName: string;
  avatarPhotoUrl: string | null;
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
  status: 'open' | 'done';
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
  recurrenceRule: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceUntil: string | null;
}

export interface AdminFeedbackReport {
  id: number;
  reporterName: string;
  householdName: string | null;
  category: 'bug' | 'idea' | 'other';
  message: string;
  pagePath: string | null;
  status: 'open' | 'done';
  createdAt: string;
}

export interface AdminNotice {
  id: number;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminSystemStatus {
  serverTime: string;
  phpVersion: string;
  database: {
    driver: string;
    foreignKeys: boolean;
  };
  migrations: {
    total: number;
    applied: number;
    pending: number;
    pendingFiles: string[];
    latestApplied: {
      filename: string;
      appliedAt: string;
    } | null;
  };
  pwa: Array<{
    label: string;
    path: string;
    exists: boolean;
  }>;
  push: {
    subscriptions: number;
    vapidKeys: number;
    vapidConfigured: boolean;
  };
  featureFlags: FeatureFlags;
}

export interface AdminDigestItem {
  id: string;
  title: string;
  meta: string;
  detail: string;
  tone?: 'important' | 'helpful' | 'event' | 'calendar' | 'trash' | 'feed';
}

export interface AdminDigestSection {
  title: string;
  emptyText: string;
  items: AdminDigestItem[];
}

export interface AdminWeeklyDigest {
  generatedAt: string;
  rangeLabel: string;
  streetName: string;
  headline: string;
  intro: string;
  highlights: AdminDigestItem[];
  recipients: {
    active: number;
    disabled: number;
    withoutEmail: number;
    totalWithEmail: number;
    total: number;
  };
  history: Array<{
    id: number;
    weekKey: string;
    email: string;
    displayName: string | null;
    sentAt: string;
  }>;
  summary: {
    feedCount: number;
    eventCount: number;
    calendarCount: number;
    trashCount: number;
  };
  sections: AdminDigestSection[];
}

export interface AdminDigestTestResult {
  sentTo: string;
  digest: AdminWeeklyDigest;
}

export interface AdminDigestSendResult {
  weekKey: string;
  sent: number;
  skipped: number;
  failed: number;
  recipients: number;
  details: Array<{
    email: string;
    status: 'sent' | 'skipped' | 'failed';
  }>;
}

export interface AdminTrashReminderPreview {
  date: string;
  entries: number;
  titles: string[];
  mailTotal: number;
}

export interface AdminTrashReminderSendResult {
  date: string;
  entries: number;
  titles: string[];
  push: PushSendResult | null;
  mailSent: number;
  mailTotal: number;
}
