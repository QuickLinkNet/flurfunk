import type { FeatureKey } from '../types/featureFlags';

export type AppNavIcon =
  | 'users' | 'calendar' | 'bell' | 'shield' | 'mail' | 'lock'
  | 'ticket' | 'eye' | 'home' | 'street' | 'settings' | 'briefcase' | 'trash' | 'help' | 'feedback' | 'chat';

export interface AppNavItem {
  to: string;
  label: string;
  icon: AppNavIcon;
  mobileIcon: string;
  feature?: FeatureKey;
  adminOnly?: boolean;
  onboardingOnly?: boolean;
  mobilePrimary?: boolean;
}

export const appNavItems: AppNavItem[] = [
  { to: '/start', label: 'Start einrichten', icon: 'home', mobileIcon: '🏁', onboardingOnly: true },
  { to: '/dashboard', label: 'Dashboard', icon: 'home', mobileIcon: '🏠', mobilePrimary: true },
  { to: '/kalender', label: 'Kalender', icon: 'calendar', mobileIcon: '🗓️', feature: 'calendar', mobilePrimary: true },
  { to: '/events', label: 'Events', icon: 'ticket', mobileIcon: '🎉', feature: 'events', mobilePrimary: true },
  { to: '/strasse', label: 'Straße', icon: 'street', mobileIcon: '💬', feature: 'feed', mobilePrimary: true },
  { to: '/hilfe', label: 'Hilfe', icon: 'help', mobileIcon: '🙋', feature: 'feed' },
  { to: '/nachbarn', label: 'Nachbarn', icon: 'users', mobileIcon: '👥' },
  { to: '/nachrichten', label: 'Nachrichten', icon: 'chat', mobileIcon: '✉️' },
  { to: '/feedback', label: 'Feedback', icon: 'feedback', mobileIcon: '🐞' },
  { to: '/einstellungen', label: 'Einstellungen', icon: 'settings', mobileIcon: '⚙️' },
  { to: '/admin', label: 'Verwaltung', icon: 'briefcase', mobileIcon: '💼', adminOnly: true }
];
