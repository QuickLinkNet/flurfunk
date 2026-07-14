import { AdminSection } from '../molecules/AdminSection';
import type { AdminTab } from '../../types/admin';

interface Props {
  householdCount: number;
  openInviteCount: number;
  userCount: number;
  openOnboardingCount: number;
  feedCount: number;
  eventCount: number;
  calendarCount: number;
  noticeCount: number;
  onNavigate: (tab: AdminTab) => void;
}

export function AdminOverview({
  householdCount,
  openInviteCount,
  userCount,
  openOnboardingCount,
  feedCount,
  eventCount,
  calendarCount,
  noticeCount,
  onNavigate
}: Props) {
  return (
    <AdminSection title="Übersicht">
      <div className="admin-summary-grid">
        <button type="button" onClick={() => onNavigate('households')}>Haushalte: {householdCount}</button>
        <button type="button" onClick={() => onNavigate('invites')}>Offene Einladungen: {openInviteCount}</button>
        <button type="button" onClick={() => onNavigate('users')}>Nutzer: {userCount}</button>
        <button type="button" onClick={() => onNavigate('users')}>Onboarding offen: {openOnboardingCount}</button>
        <button type="button" onClick={() => onNavigate('content')}>Feed: {feedCount}</button>
        <button type="button" onClick={() => onNavigate('content')}>Events: {eventCount}</button>
        <button type="button" onClick={() => onNavigate('calendar')}>Kalender: {calendarCount}</button>
        <button type="button" onClick={() => onNavigate('content')}>Hinweise: {noticeCount}</button>
      </div>
    </AdminSection>
  );
}
