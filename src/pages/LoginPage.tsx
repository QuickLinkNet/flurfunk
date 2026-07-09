import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Login fehlgeschlagen. E-Mail oder Passwort prüfen.');
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: '0 var(--md-space-5)' }}>
      <h1 style={{ fontSize: 'var(--md-font-size-2xl)', fontWeight: 'var(--md-font-weight-medium)' }}>Anmelden</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-3)' }}>
        <Input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'var(--md-color-error)', fontSize: 'var(--md-font-size-base)' }}>{error}</p>}
        <Button type="submit">Anmelden</Button>
      </form>
      <p style={{ fontSize: 'var(--md-font-size-base)', marginTop: 'var(--md-space-4)' }}>
        Noch kein Konto? <Link to="/registrieren">Haushalt registrieren</Link>
      </p>
    </div>
  );
}
