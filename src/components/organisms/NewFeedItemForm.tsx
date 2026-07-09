import { useState, type FormEvent } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createFeedItem } from '../../api/feedApi';
import { FEED_TYPE_OPTIONS } from '../../utils/feedTypeMeta';
import type { FeedItemType } from '../../types/feedItem';

interface Props {
  onCreated: () => void;
}

export function NewFeedItemForm({ onCreated }: Props) {
  const [type, setType] = useState<FeedItemType>('help_needed');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createFeedItem({ type, message: message || undefined });
      setMessage('');
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      <Select value={type} onChange={(e) => setType(e.target.value as FeedItemType)}>
        {FEED_TYPE_OPTIONS.map(([value, meta]) => (
          <option key={value} value={value}>
            {meta.emoji} {meta.label}
          </option>
        ))}
      </Select>
      <Input
        placeholder="Kurze Nachricht (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={280}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Wird gepostet …' : 'In der Straße teilen'}
      </Button>
    </form>
  );
}
