import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Select } from '../atoms/Select';
import { Textarea } from '../atoms/Textarea';
import { Button } from '../atoms/Button';
import { submitFeedback } from '../../api/feedbackApi';
import type { FeedbackCategory } from '../../types/feedback';

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: '🐞 Bug / Fehler',
  idea: '💡 Idee / Wunsch',
  other: '✏️ Sonstiges'
};

export function NewFeedbackForm() {
  const location = useLocation();
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setFeedback('Bitte kurz beschreiben, worum es geht.');
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await submitFeedback({ category, message: trimmed, pagePath: location.pathname });
      setMessage('');
      setFeedback('Danke! Kommt direkt bei den Admins an.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Konnte nicht gesendet werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--md-space-3)' }}>
      <Select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}>
        {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((key) => (
          <option key={key} value={key}>
            {CATEGORY_LABELS[key]}
          </option>
        ))}
      </Select>
      <Textarea
        placeholder="Was ist los? Kurz beschreiben ..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={500}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Wird gesendet...' : 'An die Admins senden'}
      </Button>
      {feedback && (
        <p style={{ margin: 0, fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>
          {feedback}
        </p>
      )}
    </form>
  );
}
