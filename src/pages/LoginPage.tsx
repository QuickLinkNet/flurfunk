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
    <div style={{ maxWidth: 360, margin: '80px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500 }}>Anmelden</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}
        <Button type="submit">Anmelden</Button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16 }}>
        Noch kein Konto? <Link to="/registrieren">Haushalt registrieren</Link>
      </p>
    </div>
  );
}
