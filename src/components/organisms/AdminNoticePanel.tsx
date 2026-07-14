import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { AdminDeleteButton } from '../molecules/AdminDeleteButton';
import { AdminListStack } from '../molecules/AdminListStack';
import { CardRow } from '../molecules/CardRow';
import { createAdminNotice } from '../../api/adminApi';
import { formatDateTimeLabel } from '../../utils/date';
import type { AdminNotice } from '../../types/admin';

interface Props {
  notices: AdminNotice[];
  onCreated: () => void;
  onDelete: (id: number) => void;
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

  return (
    <div className="md-stack">
      <form onSubmit={handleSubmit} className="md-stack">
        <Input placeholder="Titel" value={title} onChange={(event) => setTitle(event.target.value)} />
        <textarea
          placeholder="Nachricht"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: 'var(--md-space-3) var(--md-space-4)',
            border: '1px solid var(--md-color-border)',
            borderRadius: 'var(--md-radius-control)',
            background: 'rgba(255, 253, 252, 0.82)',
            color: 'var(--md-color-on-surface)',
            font: 'inherit',
            resize: 'vertical'
          }}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Speichert...' : 'Hinweis anlegen'}
        </Button>
        {feedback && <p style={{ margin: 0, color: feedback.includes('Pflicht') || feedback.includes('nicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>{feedback}</p>}
      </form>

      <AdminListStack>
        {notices.map((notice) => (
          <CardRow key={notice.id} action={<AdminDeleteButton onClick={() => onDelete(notice.id)} />}>
            <p style={{ margin: 0, fontWeight: 'var(--md-font-weight-medium)' }}>{notice.title}</p>
            <p style={{ margin: 'var(--md-space-1) 0 0', color: 'var(--md-color-on-surface-variant)' }}>{notice.message}</p>
            <p style={{ margin: 'var(--md-space-1) 0 0', color: 'var(--md-color-on-surface-variant)', fontSize: 'var(--md-font-size-sm)' }}>
              {notice.isActive ? 'Aktiv' : 'Inaktiv'} · {formatDateTimeLabel(notice.createdAt)}
            </p>
          </CardRow>
        ))}
      </AdminListStack>
    </div>
  );
}
