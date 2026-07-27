import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { AuthInputField } from '../components/molecules/AuthInputField';
import { AuthShell } from '../components/templates/AuthShell';
import { requestPasswordReset } from '../api/authApi';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Anfrage konnte nicht gesendet werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Passwort vergessen" subtitle="Wir schicken dir einen Link zum Zurücksetzen.">
      {message ? (
        <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-on-surface-variant)' }}>{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <AuthInputField
            icon="mail"
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Wird gesendet...' : 'Link anfordern'}
          </Button>
        </form>
      )}
      <div className="auth-footer">
        <span>Doch wieder eingefallen?</span>
        <Link to="/login">Anmelden</Link>
      </div>
    </AuthShell>
  );
}
