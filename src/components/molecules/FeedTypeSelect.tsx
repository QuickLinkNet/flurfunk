import { Select } from '../atoms/Select';
import { FEED_TYPE_OPTIONS } from '../../utils/feedTypeMeta';
import type { FeedItemType } from '../../types/feedItem';

interface Props {
  value: FeedItemType;
  onChange: (value: FeedItemType) => void;
}

export function FeedTypeSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value as FeedItemType)}>
      {FEED_TYPE_OPTIONS.map(([optionValue, meta]) => (
        <option key={optionValue} value={optionValue}>
          {meta.emoji} {meta.label}
        </option>
      ))}
    </Select>
  );
}
