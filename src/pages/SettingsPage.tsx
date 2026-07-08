import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { Select } from '../components/atoms/Select';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../context/ThemeContext';

const THEME_LABELS: Record<Theme, string> = {
  system: 'Systemeinstellung',
  light: 'Hell',
  dark: 'Dunkel'
};

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <DashboardTemplate header={<h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Einstellungen</h1>}>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Darstellung</h2>
        <Select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} style={{ maxWidth: 220 }}>
          {(Object.keys(THEME_LABELS) as Theme[]).map((value) => (
            <option key={value} value={value}>
              {THEME_LABELS[value]}
            </option>
          ))}
        </Select>
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Account</h2>
        <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>
          {user?.displayName} · {user?.email}
        </p>
      </section>
    </DashboardTemplate>
  );
}
