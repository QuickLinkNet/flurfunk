import type { OnboardingStep } from './onboarding';

export type UserRole = 'admin' | 'member' | 'guest';

export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  avatarPhotoUrl: string | null;
  role: UserRole;
  householdId: number | null;
  onboardingCompletedAt: string | null;
  onboardingCurrentStep: OnboardingStep;
  weeklyDigestEnabled: boolean;
  birthday: string | null;
  trashReminderPushEnabled: boolean;
  trashReminderEmailEnabled: boolean;
}
