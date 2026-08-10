import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { AuthInputField } from '../components/molecules/AuthInputField';
import { AuthShell } from '../components/templates/AuthShell';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(email, password, remember);
      navigate(loggedInUser.onboardingCompletedAt ? '/dashboard' : '/start', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen. E-Mail oder Passwort prüfen.');
    }
  }

  return (
    <AuthShell title="Flurfunk" subtitle="Was in unserer Straße wichtig ist.">
      <form onSubmit={handleSubmit}>
        <AuthInputField
          icon="mail"
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthInputField
          icon="lock"
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--md-space-2)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-space-2)', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)', cursor: 'pointer' }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Angemeldet bleiben (7 Tage)
          </label>
          <Link to="/passwort-vergessen" style={{ fontSize: 'var(--md-font-size-sm)' }}>
            Passwort vergessen?
          </Link>
        </div>
        {error && <p style={{ color: 'var(--md-color-error)', fontSize: 'var(--md-font-size-base)', margin: 0 }}>{error}</p>}
        <Button type="submit">Anmelden</Button>
      </form>
      <div className="auth-divider">oder</div>
      <Button type="button" variant="ghost" onClick={() => navigate('/registrieren')}>
        Mit Einladungscode beitreten
      </Button>
    </AuthShell>
  );
}
