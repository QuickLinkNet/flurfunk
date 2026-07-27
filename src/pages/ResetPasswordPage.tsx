import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { AuthInputField } from '../components/molecules/AuthInputField';
import { AuthShell } from '../components/templates/AuthShell';
import { confirmPasswordReset } from '../api/authApi';

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError('Dieser Link ist ungültig.');
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(token, password);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passwort konnte nicht geändert werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <AuthShell title="Neues Passwort" subtitle="Alles erledigt.">
        <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-on-surface-variant)' }}>
          Dein Passwort wurde geändert. Du kannst dich jetzt anmelden.
        </p>
        <div className="auth-footer">
          <Link to="/login">Zum Login</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Neues Passwort" subtitle="Wähle ein neues Passwort für dein Konto.">
      <form onSubmit={handleSubmit}>
        <AuthInputField
          icon="lock"
          type="password"
          placeholder="Neues Passwort (mind. 8 Zeichen)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
        {error && <p style={{ color: 'var(--md-color-error)', fontSize: 'var(--md-font-size-base)', margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird gespeichert...' : 'Passwort speichern'}
        </Button>
      </form>
      <div className="auth-footer">
        <Link to="/login">Zurück zum Login</Link>
      </div>
    </AuthShell>
  );
}
