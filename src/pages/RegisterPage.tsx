import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { AuthInputField } from '../components/molecules/AuthInputField';
import { AuthShell } from '../components/templates/AuthShell';
import { fetchInvitePreview } from '../api/inviteApi';
import { useAuth } from '../hooks/useAuth';
import type { InvitePreview } from '../types/invite';

type PreviewState = 'idle' | 'loading' | 'valid' | 'invalid';

function normalizeCode(value: string): string {
  return value.replace(/\s/g, '').toUpperCase().slice(0, 8);
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { inviteCode: codeFromUrl } = useParams<{ inviteCode?: string }>();
  const [code, setCode] = useState(normalizeCode(codeFromUrl ?? ''));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (code.length === 0) {
      setPreview(null);
      setPreviewState('idle');
      return;
    }
    if (code.length !== 8) {
      setPreview(null);
      setPreviewState('invalid');
      return;
    }

    let cancelled = false;
    setPreviewState('loading');
    fetchInvitePreview(code)
      .then((result) => {
        if (cancelled) return;
        setPreview(result);
        setPreviewState('valid');
      })
      .catch(() => {
        if (cancelled) return;
        setPreview(null);
        setPreviewState('invalid');
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (previewState !== 'valid') {
      setError('Bitte gib einen gültigen Einladungscode ein.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ code, email, password });
      navigate('/start', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Flurfunk" subtitle="Tritt deiner Straße mit Einladungscode bei.">
      <form onSubmit={handleSubmit}>
        <AuthInputField
          icon="ticket"
          placeholder="Einladungscode"
          value={code}
          onChange={(event) => setCode(normalizeCode(event.target.value))}
          autoComplete="one-time-code"
          inputMode="text"
          maxLength={8}
          required
        />
        {previewState === 'loading' && (
          <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-on-surface-variant)' }}>
            Code wird geprüft...
          </p>
        )}
        {previewState === 'valid' && preview && (
          <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-secondary)' }}>
            Hallo {preview.firstName} {preview.lastName}. Du trittst dem Haushalt "{preview.householdName}" bei.
          </p>
        )}
        {previewState === 'invalid' && (
          <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-error)' }}>
            Einladungscode ungültig oder bereits verwendet.
          </p>
        )}
        <AuthInputField icon="mail" type="email" placeholder="E-Mail-Adresse" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <AuthInputField
          icon="lock"
          type="password"
          placeholder="Passwort (mind. 8 Zeichen)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
        {error && <p style={{ color: 'var(--md-color-error)', fontSize: 'var(--md-font-size-base)', margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={isSubmitting || previewState !== 'valid'}>
          {isSubmitting ? 'Wird angelegt...' : 'Registrieren'}
        </Button>
      </form>
      <div className="auth-footer">
        <span>Schon registriert?</span>
        <Link to="/login">Anmelden</Link>
      </div>
    </AuthShell>
  );
}
