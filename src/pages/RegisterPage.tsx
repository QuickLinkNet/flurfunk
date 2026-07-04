import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { inviteCode: inviteCodeFromUrl } = useParams<{ inviteCode?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState(inviteCodeFromUrl ?? '');
  const [householdName, setHouseholdName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ email, password, displayName, inviteCode, householdName, addressLine });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500 }}>Haushalt registrieren</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input placeholder="Einladungscode" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required />
        <Input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Passwort (mind. 8 Zeichen)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <Input placeholder="Dein Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        <Input
          placeholder="Haushaltsname (z.B. Familie Schneider)"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          required
        />
        <Input
          placeholder="Adresse (Straße + Hausnummer)"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          required
        />
        {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird angelegt …' : 'Registrieren'}
        </Button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16 }}>
        Schon registriert? <Link to="/login">Anmelden</Link>
      </p>
    </div>
  );
}
