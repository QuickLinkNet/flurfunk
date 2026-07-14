import type { ReactNode } from 'react';
import { Heading } from '../atoms/Heading';

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

export function OnboardingPanel({ title, description, children }: Props) {
  return (
    <section className="onboarding-panel">
      <div className="onboarding-panel-header">
        <Heading level={2}>{title}</Heading>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}
