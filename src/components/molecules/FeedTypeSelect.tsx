import { Select } from '../atoms/Select';
import { FEED_TYPE_OPTIONS } from '../../utils/feedTypeMeta';
import type { FeedItemType } from '../../types/feedItem';

interface Props {
  value: FeedItemType;
  onChange: (value: FeedItemType) => void;
  allowedTypes?: FeedItemType[];
}

export function FeedTypeSelect({ value, onChange, allowedTypes }: Props) {
  const options = allowedTypes ? FEED_TYPE_OPTIONS.filter(([optionValue]) => allowedTypes.includes(optionValue)) : FEED_TYPE_OPTIONS;

  return (
    <Select value={value} onChange={(event) => onChange(event.target.value as FeedItemType)}>
      {options.map(([optionValue, meta]) => (
        <option key={optionValue} value={optionValue}>
          {meta.emoji} {meta.label}
        </option>
      ))}
    </Select>
  );
}
