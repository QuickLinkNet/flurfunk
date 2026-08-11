import { useState, type FormEvent } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { FeedExpirySelect, feedExpiryDate, type FeedExpiryOption } from '../molecules/FeedExpirySelect';
import { FeedTypeSelect } from '../molecules/FeedTypeSelect';
import { PhotoPickerField } from '../molecules/PhotoPickerField';
import { createFeedItem, uploadFeedPhoto } from '../../api/feedApi';
import { FEED_CATEGORY_META, FEED_CATEGORY_OPTIONS, FEED_TYPE_META, type FeedCategory } from '../../utils/feedTypeMeta';
import type { FeedItemType } from '../../types/feedItem';

interface Props {
  onCreated: () => void;
  initialType?: FeedItemType;
  allowedTypes?: FeedItemType[];
}

function categoryForType(type: FeedItemType): FeedCategory {
  return FEED_CATEGORY_OPTIONS.find(([value, meta]) => value !== 'all' && meta.types.includes(type))?.[0] ?? 'help';
}

export function NewFeedItemForm({ onCreated, initialType = 'help_needed', allowedTypes }: Props) {
  const [type, setType] = useState<FeedItemType>(initialType);
  const [category, setCategory] = useState<FeedCategory>(categoryForType(initialType));
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<'neighbors' | 'public'>('neighbors');
  const [expires, setExpires] = useState<FeedExpiryOption>('week');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pickerKey, setPickerKey] = useState(0);

  function handleTypeChange(nextType: FeedItemType) {
    setType(nextType);
  }

  function handleCategoryChange(nextCategory: FeedCategory) {
    const nextTypes = FEED_CATEGORY_META[nextCategory].types.filter((item) => !allowedTypes || allowedTypes.includes(item));
    setCategory(nextCategory);
    if (nextTypes.length > 0 && !nextTypes.includes(type)) {
      setType(nextTypes[0]);
    }
  }

  const categoryTypes = FEED_CATEGORY_META[category].types.filter((item) => !allowedTypes || allowedTypes.includes(item));
  const selectableTypes = categoryTypes.length > 0 ? categoryTypes : allowedTypes;
  const categoryOptions = FEED_CATEGORY_OPTIONS.filter(
    ([value, meta]) => value !== 'all' && meta.types.some((item) => !allowedTypes || allowedTypes.includes(item))
  );

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
      if (photoFile) {
        try {
          await uploadFeedPhoto(result.id, photoFile);
        } catch {
          // Post ist schon erstellt, Foto ist nur ein Zusatz - nicht blockierend.
        }
      }
      setMessage('');
      setPhotoFile(null);
      setPickerKey((key) => key + 1);
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
      <div className="feed-category-picker" role="radiogroup" aria-label="Kategorie wählen">
        {categoryOptions.map(([value, meta]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={category === value}
            data-active={category === value}
            onClick={() => handleCategoryChange(value)}
          >
            {meta.label}
          </button>
        ))}
      </div>
      <FeedTypeSelect value={type} onChange={handleTypeChange} allowedTypes={selectableTypes} />
      <Input
        placeholder={FEED_TYPE_META[type].template}
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
      <PhotoPickerField key={pickerKey} onFileSelected={setPhotoFile} />
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
