import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { Select } from '../components/atoms/Select';
import { Heading } from '../components/atoms/Heading';
import { EmailNotificationSettings } from '../components/organisms/EmailNotificationSettings';
import { PushNotificationSettings } from '../components/organisms/PushNotificationSettings';
import { ProfileSettings } from '../components/organisms/ProfileSettings';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { Theme } from '../context/ThemeContext';

const THEME_LABELS: Record<Theme, string> = {
  light: 'Hell',
  dark: 'Dunkel (Nachtmodus)',
  system: 'Systemeinstellung'
};

export function SettingsPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.settings.title} pageSubtitle={PAGE_HEADERS.settings.subtitle}>
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
        <Heading level={2}>Benachrichtigungen</Heading>
        <EmailNotificationSettings />
        <PushNotificationSettings />
      </section>
      <section>
        <Heading level={2}>Account</Heading>
        <ProfileSettings />
        <Button type="button" variant="ghost" onClick={handleLogout}>
          Abmelden
        </Button>
      </section>
    </DashboardTemplate>
  );
}
