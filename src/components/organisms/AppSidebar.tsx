import { NavLink } from 'react-router-dom';
import { BrandMark } from '../atoms/BrandMark';
import { FeatureIcon } from '../atoms/FeatureIcon';
import { useAuth } from '../../hooks/useAuth';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { appNavItems } from '../../navigation/appNavigation';

export function AppSidebar() {
  const { isEnabled } = useFeatureFlags();
  const { user } = useAuth();
  const visibleItems = appNavItems.filter((item) => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.onboardingOnly && user?.onboardingCompletedAt) return false;
    return !item.feature || isEnabled(item.feature);
  });

  return (
    <aside className="dashboard-sidebar">
      <div className="app-sidebar-brand">
        <BrandMark size={42} />
        Flurfunk
      </div>
      <nav className="app-sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `app-sidebar-link${isActive ? ' is-active' : ''}`}>
            <FeatureIcon name={item.icon} size={28} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="app-sidebar-profile">
        <span>{user?.displayName?.slice(0, 1).toUpperCase() ?? 'F'}</span>
        <div>
          <strong>{user?.displayName ?? 'Flurfunk'}</strong>
          <small>{user?.role === 'admin' ? 'Verwaltung' : 'Nachbarschaft'}</small>
        </div>
      </div>
    </aside>
  );
}
