import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { Select } from '../components/atoms/Select';
import { Heading } from '../components/atoms/Heading';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../context/ThemeContext';

const THEME_LABELS: Record<Theme, string> = {
  light: 'Hell',
  dark: 'Dunkel (Nachtmodus)',
  system: 'Systemeinstellung'
};

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <DashboardTemplate header={<Heading level={1}>Einstellungen</Heading>}>
      <section>
        <Heading level={2}>Darstellung</Heading>
        <Select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} style={{ maxWidth: 220 }}>
          {(Object.keys(THEME_LABELS) as Theme[]).map((value) => (
            <option key={value} value={value}>
              {THEME_LABELS[value]}
            </option>
          ))}
        </Select>
      </section>
      <section>
        <Heading level={2}>Account</Heading>
        <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>
          {user?.displayName} · {user?.email}
        </p>
      </section>
    </DashboardTemplate>
  );
}
