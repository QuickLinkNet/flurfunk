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
    <div style={{ maxWidth: 360, margin: '40px auto', padding: '0 var(--md-space-5)' }}>
      <h1 style={{ fontSize: 'var(--md-font-size-2xl)', fontWeight: 'var(--md-font-weight-medium)' }}>Registrieren</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-3)' }}>
        <Input
          placeholder="Einladungscode"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          required
        />
        {preview && (
          <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-secondary)' }}>
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
        {error && <p style={{ color: 'var(--md-color-error)', fontSize: 'var(--md-font-size-base)' }}>{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird angelegt …' : 'Registrieren'}
        </Button>
      </form>
      <p style={{ fontSize: 'var(--md-font-size-base)', marginTop: 'var(--md-space-4)' }}>
        Schon registriert? <Link to="/login">Anmelden</Link>
      </p>
    </div>
  );
}
