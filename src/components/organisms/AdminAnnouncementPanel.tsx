import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { sendAdminBroadcastPush } from '../../api/adminApi';

// Push-Ankündigung an alle Abonnenten, z. B. für ein neues Feature - mit
// direkter Verlinkung. Nutzt den schon vorhandenen PushService::sendBroadcast
// (bisher nur intern für Terminfindungs-Ergebnisse genutzt). Erreicht nur
// Nutzer mit aktivierten Push-Benachrichtigungen, keine Zustellgarantie an
// wirklich jeden - dafür bräuchte es ein eigenes In-App-Postfach.
export function AdminAnnouncementPanel() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [path, setPath] = useState('/rezepte');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    if (!title.trim() || !message.trim()) {
      setFeedback('Titel und Nachricht sind Pflicht.');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendAdminBroadcastPush(title.trim(), message.trim(), path.trim());
      setFeedback(`Push gesendet: ${result.sent} von ${result.total} Nachbarn erreicht.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Push konnte nicht gesendet werden.');
    } finally {
      setIsSending(false);
    }
  }

  const isError = Boolean(feedback && (feedback.includes('Pflicht') || feedback.includes('nicht gesendet')));

  return (
    <form onSubmit={handleSubmit} className="admin-notice-form">
      <label>
        Titel
        <Input placeholder="z. B. Neu: Rezepte! 🍝" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} />
      </label>
      <label>
        Nachricht
        <Textarea
          placeholder="Kurzer Teaser, was es Neues gibt"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={2}
          maxLength={160}
        />
      </label>
      <label>
        Link (öffnet beim Antippen der Push-Nachricht)
        <Input placeholder="/rezepte" value={path} onChange={(event) => setPath(event.target.value)} />
      </label>
      <div className="admin-notice-form-actions">
        <Button type="submit" disabled={isSending}>
          {isSending ? 'Sendet...' : 'Push an alle senden'}
        </Button>
        {feedback && (
          <p className="admin-content-message" data-tone={isError ? 'error' : 'default'}>
            {feedback}
          </p>
        )}
      </div>
    </form>
  );
}
