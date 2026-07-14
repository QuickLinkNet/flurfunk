import type { OnboardingStep } from '../../types/onboarding';

interface StepConfig {
  id: OnboardingStep;
  label: string;
  description: string;
}

interface Props {
  steps: StepConfig[];
  activeStep: OnboardingStep;
  onSelect: (step: OnboardingStep) => void;
}

export function OnboardingStepper({ steps, activeStep, onSelect }: Props) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <nav className="onboarding-stepper" aria-label="Onboarding-Schritte">
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;
        const isDone = index < activeIndex;

        return (
          <button key={step.id} type="button" data-active={isActive} data-done={isDone} onClick={() => onSelect(step.id)}>
            <span>{isDone ? '✓' : index + 1}</span>
            <strong>{step.label}</strong>
            <small>{step.description}</small>
          </button>
        );
      })}
    </nav>
  );
}
