import { NavLink } from 'react-router-dom';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import type { FeatureKey } from '../../types/featureFlags';

const items: Array<{ to: string; label: string; icon: string; feature?: FeatureKey }> = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/kalender', label: 'Kalender', icon: '📅', feature: 'calendar' },
  { to: '/events', label: 'Events', icon: '🎉', feature: 'events' },
  { to: '/strasse', label: 'Straße', icon: '💬', feature: 'feed' },
  { to: '/haushalt/mein', label: 'Mehr', icon: '☰' }
];

// Primäre mobile Navigation, siehe PRD Kapitel 7 (Sitemap).
export function BottomNavigation() {
  const { isEnabled } = useFeatureFlags();
  const visibleItems = items.filter((item) => !item.feature || isEnabled(item.feature));
  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        background: 'var(--md-color-surface)',
        borderTop: '1px solid var(--md-color-border)'
      }}
    >
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            textAlign: 'center',
            fontSize: 10,
            textDecoration: 'none',
            color: isActive ? 'var(--md-color-primary)' : 'var(--md-color-on-surface-variant)'
          })}
        >
          <div style={{ fontSize: 18 }}>{item.icon}</div>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
