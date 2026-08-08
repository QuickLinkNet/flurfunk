import type { AdminTab } from '../../types/admin';

const TABS: Array<{ id: AdminTab; label: string }> = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'households', label: 'Haushalte' },
  { id: 'invites', label: 'Einladungen' },
  { id: 'users', label: 'Nutzer' },
  { id: 'content', label: 'Inhalte' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'calendar', label: 'Kalender' },
  { id: 'system', label: 'System' }
];

interface Props {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
}

export function AdminTabs({ activeTab, onChange }: Props) {
  return (
    <nav className="admin-tabs" aria-label="Adminbereiche">
      {TABS.map((tab) => (
        <button key={tab.id} type="button" data-active={activeTab === tab.id} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
