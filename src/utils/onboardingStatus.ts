import type { OnboardingStep } from '../types/onboarding';

const STEP_LABELS: Record<OnboardingStep, string> = {
  household: 'Haushalt',
  family: 'Familie',
  privacy: 'Privatsphäre',
  push: 'Push'
};

export function onboardingStatusLabel(completedAt: string | null, currentStep?: OnboardingStep): string {
  if (completedAt) return 'Onboarding fertig';
  return `Onboarding: ${STEP_LABELS[currentStep ?? 'household']}`;
}

export function onboardingFollowUpLabel(currentStep?: OnboardingStep): string {
  return STEP_LABELS[currentStep ?? 'household'];
}
