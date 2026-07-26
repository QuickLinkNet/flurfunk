import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { StatusPill } from '../atoms/StatusPill';
import { Textarea } from '../atoms/Textarea';
import { AdminContentCard } from '../molecules/AdminContentCard';
import { AdminEmptyState } from '../molecules/AdminEmptyState';
import { createAdminNotice } from '../../api/adminApi';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminNotice } from '../../types/admin';

interface Props {
  notices: AdminNotice[];
  onCreated: () => void;
  onDelete: (id: number) => void;
}

function normalizeDate(value: string): string {
  return value.replace(' ', 'T');
}

export function AdminNoticePanel({ notices, onCreated, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    if (!title.trim() || !message.trim()) {
      setFeedback('Titel und Nachricht sind Pflicht.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdminNotice(title.trim(), message.trim());
      setTitle('');
      setMessage('');
      setFeedback('Hinweis gespeichert.');
      onCreated();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Hinweis konnte nicht gespeichert werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isError = Boolean(feedback && (feedback.includes('Pflicht') || feedback.includes('nicht')));

  return (
    <div className="md-stack">
      <form onSubmit={handleSubmit} className="admin-notice-form">
        <label>
          Titel
          <Input placeholder="z. B. Kanalreinigung am Freitag" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Nachricht
          <Textarea
            placeholder="Kurzer Hinweis für die Straße"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
          />
        </label>
        <div className="admin-notice-form-actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Speichert...' : 'Hinweis anlegen'}
          </Button>
          {feedback && (
            <p className="admin-content-message" data-tone={isError ? 'error' : 'default'}>
              {feedback}
            </p>
          )}
        </div>
      </form>

      {notices.length === 0 ? (
        <AdminEmptyState>Noch keine Hinweise vorhanden.</AdminEmptyState>
      ) : (
        <div className="admin-content-list">
          {notices.map((notice) => (
            <AdminContentCard
              key={notice.id}
              title={notice.title}
              onDelete={() => onDelete(notice.id)}
              meta={
                <>
                  <StatusPill label={notice.isActive ? 'Aktiv' : 'Inaktiv'} tone={notice.isActive ? 'success' : 'neutral'} />
                  <StatusPill label={formatDateTimeLabel(normalizeDate(notice.createdAt))} />
                </>
              }
            >
              <p>{notice.message}</p>
            </AdminContentCard>
          ))}
        </div>
      )}
    </div>
  );
}
