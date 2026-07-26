import type { OnboardingStep } from './onboarding';

export interface InviteUsedByUser {
  id: number;
  email: string;
  displayName: string;
  onboardingCompletedAt: string | null;
  onboardingCurrentStep: OnboardingStep;
  pushSubscribed: boolean;
}

export interface InvitePreview {
  firstName: string;
  lastName: string;
  householdName: string | null;
}

export interface HouseholdInvitePerson {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string | null;
  emailSentAt: string | null;
  emailLastSentAt: string | null;
  emailSendCount: number;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  usedByUser: InviteUsedByUser | null;
}
