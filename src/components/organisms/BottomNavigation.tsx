import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FeatureIcon } from '../atoms/FeatureIcon';
import { useAuth } from '../../hooks/useAuth';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { appNavItems } from '../../navigation/appNavigation';

export function BottomNavigation() {
  const { isEnabled } = useFeatureFlags();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const visibleItems = appNavItems.filter((item) => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.onboardingOnly && user?.onboardingCompletedAt) return false;
    return !item.feature || isEnabled(item.feature);
  });
  const visiblePrimaryItems = visibleItems.filter((item) => item.mobilePrimary);
  const visibleMoreItems = visibleItems.filter((item) => !item.mobilePrimary);
  const isMoreActive = isMoreOpen || visibleMoreItems.some((item) => location.pathname.startsWith(item.to));

  async function handleLogout() {
    await logout();
    setIsMoreOpen(false);
    navigate('/login', { replace: true });
  }

  return (
    <>
      {isMoreOpen && (
        <div className="bottom-more-backdrop" role="presentation" onMouseDown={() => setIsMoreOpen(false)}>
          <section
            className="bottom-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Weitere Navigation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="bottom-more-profile">
              <span>{user?.displayName?.slice(0, 1).toUpperCase() ?? 'F'}</span>
              <div>
                <strong>{user?.displayName ?? 'Flurfunk'}</strong>
                <small>{user?.role === 'admin' ? 'Verwaltung' : 'Nachbarschaft'}</small>
              </div>
            </div>
            <nav className="bottom-more-list">
              {visibleMoreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMoreOpen(false)}
                  className={({ isActive }) => `bottom-more-link${isActive ? ' is-active' : ''}`}
                >
                  <FeatureIcon name={item.icon} size={34} />
                  {item.label}
                </NavLink>
              ))}
              <button type="button" className="bottom-more-link" onClick={handleLogout}>
                <FeatureIcon name="lock" size={34} />
                Abmelden
              </button>
            </nav>
          </section>
        </div>
      )}
      <nav className="bottom-navigation">
        {visiblePrimaryItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-navigation-link${isActive ? ' is-active' : ''}`}
          >
            <span className="bottom-navigation-emoji" aria-hidden="true">{item.mobileIcon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          className={`bottom-navigation-link bottom-navigation-button${isMoreActive ? ' is-active' : ''}`}
          onClick={() => setIsMoreOpen((current) => !current)}
          aria-expanded={isMoreOpen}
        >
          <span className="bottom-navigation-emoji" aria-hidden="true">⋯</span>
          Mehr
        </button>
      </nav>
    </>
  );
}
