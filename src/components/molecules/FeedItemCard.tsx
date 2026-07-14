import { IconBadge } from '../atoms/IconBadge';
import { FEED_TYPE_META } from '../../utils/feedTypeMeta';
import type { FeedItem } from '../../types/feedItem';

interface Props {
  item: FeedItem;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value.replace(' ', 'T')));
}

function visibilityLabel(value: FeedItem['visibility']): string {
  if (value === 'public') return 'öffentlich';
  if (value === 'private') return 'privat';
  return 'Nachbarschaft';
}

export function FeedItemCard({ item }: Props) {
  const meta = FEED_TYPE_META[item.type];
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--md-space-3)',
        padding: 'var(--md-space-3) var(--md-space-4)',
        borderRadius: 'var(--md-radius-card)',
        background: 'var(--md-color-surface)',
        border: '1px solid var(--md-color-border)',
        boxShadow: 'var(--md-shadow-card)'
      }}
    >
      <IconBadge emoji={meta.emoji} tint={meta.tint} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
          {item.householdName} · {meta.label}
        </p>
        {item.message && (
          <p
            style={{
              margin: 'var(--md-space-1) 0 0',
              fontSize: 'var(--md-font-size-sm)',
              color: 'var(--md-color-on-surface-variant)'
            }}
          >
            {item.message}
          </p>
        )}
        <p style={{ margin: 'var(--md-space-2) 0 0', fontSize: 'var(--md-font-size-xs)', color: 'var(--md-color-on-surface-variant)' }}>
          {visibilityLabel(item.visibility)} · {formatDate(item.createdAt)}
          {item.expiresAt ? ` · bis ${formatDate(item.expiresAt)}` : ''}
        </p>
      </div>
    </div>
  );
}
