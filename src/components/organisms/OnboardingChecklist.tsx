import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { FeatureIcon } from '../atoms/FeatureIcon';
import type { OnboardingStep } from '../../types/onboarding';
import { onboardingFollowUpLabel } from '../../utils/onboardingStatus';

interface Props {
  onStatusClick: () => void;
  onDismiss?: () => void;
  currentStep?: OnboardingStep;
  required?: boolean;
}

const steps = [
  {
    icon: 'home' as const,
    title: 'Status setzen',
    text: 'Sag der Straße kurz, ob ihr zuhause, unterwegs oder im Urlaub seid.'
  },
  {
    icon: 'bell' as const,
    title: 'Push aktivieren',
    text: 'Wichtige Hinweise und Antworten kommen direkt auf dieses Gerät.'
  },
  {
    icon: 'shield' as const,
    title: 'Privatsphäre prüfen',
    text: 'Legt fest, welche Infos nur Nachbarn oder niemand sehen darf.'
  }
];

export function OnboardingChecklist({ onStatusClick, onDismiss, currentStep = 'household', required = false }: Props) {
  return (
    <section className="onboarding-card" aria-label="Erste Schritte">
      <div className="onboarding-card-header">
        <div>
          <p>{required ? `Offen: ${onboardingFollowUpLabel(currentStep)}` : 'Willkommen in eurer Straße'}</p>
          <h2>{required ? 'Einrichtung fortsetzen' : 'In zwei Minuten startklar'}</h2>
        </div>
        {!required && onDismiss && (
          <button type="button" onClick={onDismiss} aria-label="Onboarding ausblenden">
            ×
          </button>
        )}
      </div>
      {required && (
        <p className="onboarding-required-copy">
          Schließt die Startschritte ab, damit Haushalt, Sichtbarkeit und Benachrichtigungen sauber eingerichtet sind.
        </p>
      )}
      <div className="onboarding-steps">
        {steps.map((step) => (
          <article key={step.title} className="onboarding-step">
            <FeatureIcon name={step.icon} size={38} />
            <div>
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="onboarding-actions">
        {required ? (
          <Link className="onboarding-primary-link" to="/start">Einrichtung fortsetzen</Link>
        ) : (
          <Button type="button" onClick={onStatusClick}>Status setzen</Button>
        )}
        <Link to={required ? '/start' : '/einstellungen'}>{required ? 'Start öffnen' : 'Push & Privatsphäre'}</Link>
      </div>
    </section>
  );
}
