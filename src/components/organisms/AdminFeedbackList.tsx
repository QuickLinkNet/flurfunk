import { Button } from '../atoms/Button';
import { StatusPill } from '../atoms/StatusPill';
import { AdminContentCard } from '../molecules/AdminContentCard';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { updateAdminFeedbackStatus } from '../../api/adminApi';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminFeedbackReport } from '../../types/admin';

interface Props {
  reports: AdminFeedbackReport[];
  onDelete: (report: AdminFeedbackReport) => void;
  onChanged: () => void;
}

const CATEGORY_LABELS: Record<AdminFeedbackReport['category'], string> = {
  bug: '🐞 Bug',
  idea: '💡 Idee',
  other: '✏️ Sonstiges'
};

function normalizeDate(value: string): string {
  return value.replace(' ', 'T');
}

export function AdminFeedbackList({ reports, onDelete, onChanged }: Props) {
  if (reports.length === 0) {
    return <AdminEmptyState>Kein Feedback vorhanden.</AdminEmptyState>;
  }

  async function toggleStatus(report: AdminFeedbackReport) {
    await updateAdminFeedbackStatus(report.id, report.status === 'open' ? 'done' : 'open');
    onChanged();
  }

  return (
    <div className="admin-content-list">
      {reports.map((report) => (
        <AdminContentCard
          key={report.id}
          title={`${report.reporterName}${report.householdName ? ` (${report.householdName})` : ''}`}
          onDelete={() => onDelete(report)}
          meta={
            <>
              <StatusPill label={CATEGORY_LABELS[report.category]} />
              <StatusPill label={report.status === 'done' ? 'Erledigt' : 'Offen'} tone={report.status === 'done' ? 'success' : 'neutral'} />
            </>
          }
        >
          <p>{report.message}</p>
          <p>
            {formatDateTimeLabel(normalizeDate(report.createdAt))}
            {report.pagePath ? ` · Seite: ${report.pagePath}` : ''}
          </p>
          <Button type="button" variant="ghost" onClick={() => toggleStatus(report)}>
            {report.status === 'open' ? 'Als erledigt markieren' : 'Wieder öffnen'}
          </Button>
        </AdminContentCard>
      ))}
    </div>
  );
}
