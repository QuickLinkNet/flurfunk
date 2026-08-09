import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { AuthInputField } from '../components/molecules/AuthInputField';
import { AuthShell } from '../components/templates/AuthShell';
import { fetchStreetJoinPreview } from '../api/streetJoinApi';
import { useAuth } from '../hooks/useAuth';
import type { StreetJoinMode, StreetJoinPreview } from '../types/streetJoin';

type PreviewState = 'loading' | 'valid' | 'invalid';

export function JoinStreetPage() {
  const { registerViaStreetLink } = useAuth();
  const navigate = useNavigate();
  const { token = '' } = useParams<{ token: string }>();

  const [preview, setPreview] = useState<StreetJoinPreview | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>('loading');
  const [mode, setMode] = useState<StreetJoinMode | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [householdId, setHouseholdId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStreetJoinPreview(token)
      .then((result) => {
        if (cancelled) return;
        setPreview(result);
        setPreviewState('valid');
        // Bei der allerersten Familie auf der Straße gibt es nichts zum
        // Beitreten - da direkt "Neue Familie" vorauswählen. Sobald schon
        // Haushalte existieren, muss die Wahl bewusst getroffen werden
        // (siehe Testfeedback: sonst legen zwei Personen derselben Familie
        // aus Versehen zwei Haushalte an).
        setMode(result.households.length === 0 ? 'create' : null);
      })
      .catch(() => {
        if (cancelled) return;
        setPreviewState('invalid');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === null) {
      setError('Bitte zuerst auswählen, ob ihr neu seid oder eure Familie schon dabei ist.');
      return;
    }
    if (mode === 'join' && householdId === '') {
      setError('Bitte eure Familie aus der Liste auswählen.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerViaStreetLink(token, {
        mode,
        displayName,
        email,
        password,
        ...(mode === 'create' ? { name: householdName, addressLine } : { householdId: Number(householdId) })
      });
      navigate('/start', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (previewState === 'loading') {
    return (
      <AuthShell title="Flurfunk" subtitle="Einladungslink wird geprüft ...">
        <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-on-surface-variant)' }}>
          Einen Moment ...
        </p>
      </AuthShell>
    );
  }

  if (previewState === 'invalid' || !preview) {
    return (
      <AuthShell title="Flurfunk" subtitle="Dieser Einladungslink ist ungültig.">
        <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-error)' }}>
          Der Link ist ungültig oder wurde erneuert. Frag in eurer Straße nach dem aktuellen Link.
        </p>
        <div className="auth-footer">
          <Link to="/login">Zur Anmeldung</Link>
        </div>
      </AuthShell>
    );
  }

  const hasHouseholds = preview.households.length > 0;

  return (
    <AuthShell title="Flurfunk" subtitle={`Tritt "${preview.streetName}" bei.`}>
      {hasHouseholds && (
        <p className="auth-join-hint">
          Wichtig: Ist schon jemand aus deiner Familie hier angemeldet? Dann bitte <strong>nicht</strong> noch eine
          neue Familie anlegen, sondern unten "Meine Familie ist schon dabei" wählen und euch anschließen.
        </p>
      )}

      {hasHouseholds && mode === null ? (
        <div className="auth-mode-choice">
          <button type="button" className="auth-mode-choice-card" onClick={() => setMode('create')}>
            <strong>Wir sind neu</strong>
            <span>Noch niemand aus meiner Familie ist hier angemeldet.</span>
          </button>
          <button type="button" className="auth-mode-choice-card" onClick={() => setMode('join')}>
            <strong>Meine Familie ist schon dabei</strong>
            <span>Jemand aus meiner Familie hat sich schon angemeldet - ich schließe mich an.</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {hasHouseholds && (
            <div className="auth-mode-toggle" role="tablist" aria-label="Beitreten oder neue Familie anlegen">
              <button type="button" data-active={mode === 'create'} onClick={() => setMode('create')}>
                Wir sind neu
              </button>
              <button type="button" data-active={mode === 'join'} onClick={() => setMode('join')}>
                Familie ist schon dabei
              </button>
            </div>
          )}

          {mode === 'create' ? (
            <>
              <Input
                placeholder="Familienname (z.B. Familie Schmidt)"
                value={householdName}
                onChange={(event) => setHouseholdName(event.target.value)}
                required
              />
              <Input
                placeholder="Adresse (Straße, Hausnummer)"
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
                required
              />
            </>
          ) : (
            <Select value={householdId} onChange={(event) => setHouseholdId(event.target.value ? Number(event.target.value) : '')} required>
              <option value="">Familie auswählen ...</option>
              {preview.households.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.name} · {household.addressLine}
                </option>
              ))}
            </Select>
          )}

          <AuthInputField
            icon="users"
            placeholder="Dein Name (z.B. Julia Schmidt)"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
          <AuthInputField
            icon="mail"
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Wird angelegt...' : mode === 'create' ? 'Familie anlegen' : 'Beitreten'}
          </Button>
        </form>
      )}
      <div className="auth-footer">
        <span>Schon registriert?</span>
        <Link to="/login">Anmelden</Link>
      </div>
    </AuthShell>
  );
}
