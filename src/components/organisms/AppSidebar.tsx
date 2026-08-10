import { NavLink } from 'react-router-dom';
import { BrandMark } from '../atoms/BrandMark';
import { FeatureIcon } from '../atoms/FeatureIcon';
import { UserAvatar } from '../atoms/UserAvatar';
import { useAuth } from '../../hooks/useAuth';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { useMessages } from '../../hooks/useMessages';
import { appNavItems } from '../../navigation/appNavigation';

export function AppSidebar() {
  const { isEnabled } = useFeatureFlags();
  const { user } = useAuth();
  const { unreadCount } = useMessages();
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
            {item.to === '/nachrichten' && unreadCount > 0 && (
              <span className="app-sidebar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="app-sidebar-profile">
        <UserAvatar avatarUrl={user?.avatarUrl} photoUrl={user?.avatarPhotoUrl} fallback={user?.displayName ?? 'Flurfunk'} />
        <div>
          <strong>{user?.displayName ?? 'Flurfunk'}</strong>
          <small>{user?.role === 'admin' ? 'Verwaltung' : 'Nachbarschaft'}</small>
        </div>
      </div>
    </aside>
  );
}
