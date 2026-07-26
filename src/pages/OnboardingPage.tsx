import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { OnboardingPanel } from '../components/molecules/OnboardingPanel';
import { OnboardingStepper } from '../components/molecules/OnboardingStepper';
import type { HouseholdDetailsFormHandle } from '../components/molecules/HouseholdDetailsForm';
import { ChildrenManager } from '../components/organisms/ChildrenManager';
import { EmailNotificationSettings } from '../components/organisms/EmailNotificationSettings';
import { MyHouseholdDetailsForm } from '../components/organisms/MyHouseholdDetailsForm';
import { PetsManager } from '../components/organisms/PetsManager';
import { PushNotificationSettings } from '../components/organisms/PushNotificationSettings';
import { VisibilitySettingsForm } from '../components/organisms/VisibilitySettingsForm';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { useAuth } from '../hooks/useAuth';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import type { OnboardingStep } from '../types/onboarding';

const STEPS: Array<{ id: OnboardingStep; label: string; description: string }> = [
  { id: 'household', label: 'Haushalt', description: 'Grunddaten & Adresse' },
  { id: 'family', label: 'Familie', description: 'Mitglieder hinzufügen' },
  { id: 'privacy', label: 'Privatsphäre', description: 'Einstellungen wählen' },
  { id: 'push', label: 'Hinweise', description: 'Push & E-Mail' }
];

function stepIndex(step: OnboardingStep): number {
  return STEPS.findIndex((item) => item.id === step);
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, completeOnboarding, saveOnboardingProgress } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const initialStep = user?.onboardingCurrentStep ?? 'household';
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const householdFormRef = useRef<HouseholdDetailsFormHandle>(null);
  const currentIndex = stepIndex(step);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;
  const panel = useMemo(() => {
    if (step === 'household') {
      return {
        title: 'Haushalt einrichten',
        description: 'Name, Adresse und ein Symbol helfen euren Nachbarn, euch schnell zu erkennen.'
      };
    }
    if (step === 'family') {
      return {
        title: 'Familie ergänzen',
        description: 'Kinder und Haustiere sind optional und können später jederzeit geändert werden.'
      };
    }
    if (step === 'privacy') {
      return {
        title: 'Privatsphäre festlegen',
        description: 'Bestimmt, was die Nachbarschaft von eurem Haushalt sehen darf.'
      };
    }
    return {
      title: 'Hinweise erhalten',
      description: 'Push informiert sofort, der Wochenblick fasst die wichtigsten Neuigkeiten per E-Mail zusammen.'
    };
  }, [step]);

  async function saveStepData(): Promise<boolean> {
    if (step === 'household') {
      return householdFormRef.current?.save() ?? false;
    }
    return true;
  }

  async function saveProgress(targetStep = step) {
    setIsSaving(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const saved = await saveStepData();
      if (!saved) return false;
      await saveOnboardingProgress(targetStep);
      setMessage('Zwischengespeichert.');
      return true;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Zwischenspeichern fehlgeschlagen.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function finish() {
    setIsFinishing(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      await completeOnboarding();
      localStorage.setItem('flurfunk.onboarding.dismissed', '1');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Onboarding konnte nicht abgeschlossen werden.');
    } finally {
      setIsFinishing(false);
    }
  }

  async function continueLater() {
    const saved = await saveProgress(step);
    if (!saved) return;
    navigate('/dashboard', { replace: true });
  }

  async function goToStep(nextStep: OnboardingStep) {
    const saved = await saveProgress(nextStep);
    if (!saved) return;
    setStep(nextStep);
  }

  async function goNext() {
    if (isLastStep) {
      await finish();
      return;
    }
    await goToStep(STEPS[currentIndex + 1].id);
  }

  return (
    <DashboardTemplate
      shellClassName="onboarding-shell"
      contentClassName="onboarding-template"
      pageTitle={PAGE_HEADERS.onboarding.title}
      pageSubtitle={PAGE_HEADERS.onboarding.subtitle}
      headerAside={
        <Button type="button" variant="ghost" onClick={continueLater} disabled={isSaving || isFinishing}>
          Später fortsetzen
        </Button>
      }
    >
      <section className="onboarding-workspace">
        <OnboardingStepper steps={STEPS} activeStep={step} onSelect={goToStep} />

        <OnboardingPanel title={panel.title} description={panel.description}>
          {step === 'household' && <MyHouseholdDetailsForm ref={householdFormRef} showActions={false} />}
          {step === 'family' && (
            <div className="onboarding-stack">
              {isEnabled('children') && <ChildrenManager compact />}
              {isEnabled('pets') && <PetsManager compact />}
              {!isEnabled('children') && !isEnabled('pets') && (
                <p className="empty-note">Familienfunktionen sind aktuell deaktiviert. Du kannst später weitermachen.</p>
              )}
            </div>
          )}
          {step === 'privacy' && <VisibilitySettingsForm />}
          {step === 'push' && (
            <div className="onboarding-stack">
              <EmailNotificationSettings />
              <PushNotificationSettings />
            </div>
          )}

          <div className="onboarding-footer">
            <div className="onboarding-footer-secondary">
              <Button
                type="button"
                variant="ghost"
                disabled={isFirstStep || isSaving}
                onClick={() => goToStep(STEPS[currentIndex - 1].id)}
              >
                Zurück
              </Button>
              <Button type="button" variant="ghost" disabled={isSaving} onClick={() => saveProgress()}>
                {isSaving ? 'Speichert ...' : 'Zwischenspeichern'}
              </Button>
            </div>
            <Button type="button" disabled={isSaving || isFinishing} onClick={goNext}>
              {isLastStep ? (isFinishing ? 'Speichert ...' : 'Zum Dashboard') : 'Weiter'}
            </Button>
          </div>
          {message && <p className="onboarding-save-message">{message}</p>}
          {errorMessage && <p className="onboarding-error-message">{errorMessage}</p>}
        </OnboardingPanel>
      </section>
    </DashboardTemplate>
  );
}
