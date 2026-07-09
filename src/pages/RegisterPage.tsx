import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useAuth } from '../hooks/useAuth';
import { fetchInvitePreview } from '../api/inviteApi';
import type { InvitePreview } from '../types/invite';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { inviteCode: codeFromUrl } = useParams<{ inviteCode?: string }>();
  const [code, setCode] = useState(codeFromUrl ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const trimmed = code.trim();
    if (trimmed.length !== 8) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    fetchInvitePreview(trimmed)
      .then((p) => !cancelled && setPreview(p))
      .catch(() => !cancelled && setPreview(null));
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ code: code.trim(), email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500 }}>Registrieren</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          placeholder="Einladungscode"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          required
        />
        {preview && (
          <p style={{ fontSize: 13, margin: 0, color: 'var(--md-color-secondary)' }}>
            Hallo {preview.firstName} {preview.lastName}! Du trittst dem Haushalt "{preview.householdName}" bei.
          </p>
        )}
        <Input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Passwort (mind. 8 Zeichen)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
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
