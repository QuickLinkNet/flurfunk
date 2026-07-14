import { useState, type FormEvent } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { FeedExpirySelect, feedExpiryDate, type FeedExpiryOption } from '../molecules/FeedExpirySelect';
import { FeedTypeSelect } from '../molecules/FeedTypeSelect';
import { createFeedItem } from '../../api/feedApi';
import { FEED_TYPE_META } from '../../utils/feedTypeMeta';
import type { FeedItemType } from '../../types/feedItem';

interface Props {
  onCreated: () => void;
  initialType?: FeedItemType;
}

export function NewFeedItemForm({ onCreated, initialType = 'help_needed' }: Props) {
  const [type, setType] = useState<FeedItemType>(initialType);
  const [message, setMessage] = useState(FEED_TYPE_META[initialType].template);
  const [visibility, setVisibility] = useState<'neighbors' | 'public'>('neighbors');
  const [expires, setExpires] = useState<FeedExpiryOption>('week');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTypeChange(nextType: FeedItemType) {
    setType(nextType);
    if (!message.trim()) {
      setMessage(FEED_TYPE_META[nextType].template);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const result = await createFeedItem({
        type,
        message: message.trim() || undefined,
        visibility,
        expiresAt: feedExpiryDate(expires)
      });
      setMessage('');
      const pushInfo = result.push && result.push.total > 0 ? ` Push: ${result.push.sent}/${result.push.total}.` : '';
      setFeedback(`Kurzmeldung geteilt.${pushInfo}`);
      onCreated();
    } catch {
      setFeedback('Kurzmeldung konnte nicht geteilt werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--md-space-3)' }}>
      <FeedTypeSelect value={type} onChange={handleTypeChange} />
      <Input
        placeholder="Kurze Nachricht"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={280}
      />
      <div className="md-form-grid">
        <Select value={visibility} onChange={(event) => setVisibility(event.target.value as 'neighbors' | 'public')}>
          <option value="neighbors">Nur Nachbarschaft</option>
          <option value="public">Öffentlich</option>
        </Select>
        <FeedExpirySelect value={expires} onChange={setExpires} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Wird gepostet...' : 'In der Straße teilen'}
      </Button>
      {feedback && (
        <p style={{ margin: 0, color: feedback.includes('nicht') ? 'var(--md-color-error)' : 'var(--md-color-on-surface-variant)' }}>
          {feedback}
        </p>
      )}
    </form>
  );
}
