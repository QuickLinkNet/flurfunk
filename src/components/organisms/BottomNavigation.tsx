import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/kalender', label: 'Kalender', icon: '📅' },
  { to: '/events', label: 'Events', icon: '🎉' },
  { to: '/strasse', label: 'Straße', icon: '💬' },
  // Zeigt vorerst auf den Haushalt, bis /einstellungen als eigene Seite existiert.
  { to: '/haushalt/mein', label: 'Mehr', icon: '☰' }
];

// Primäre mobile Navigation, siehe PRD Kapitel 7 (Sitemap).
export function BottomNavigation() {
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
      {items.map((item) => (
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
