import { useState, type FormEvent } from 'react';
import { IconBadge } from '../atoms/IconBadge';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { addFeedComment, toggleFeedReaction, updateFeedStatus } from '../../api/feedApi';
import { FEED_TYPE_META } from '../../utils/feedTypeMeta';
import type { FeedComment, FeedItem, FeedItemType } from '../../types/feedItem';

interface Props {
  item: FeedItem;
  onChanged: () => void;
}

const STATUS_TYPES: FeedItemType[] = ['help_needed', 'tool_available', 'babysitter_needed', 'package_received'];

function formatDate(value: string): string {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Datum unbekannt';
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

function visibilityLabel(value: FeedItem['visibility']): string {
  if (value === 'public') return 'öffentlich';
  if (value === 'private') return 'privat';
  return 'Nachbarschaft';
}

function supportsStatus(type: FeedItemType): boolean {
  return STATUS_TYPES.includes(type);
}

function FeedCommentRow({ comment }: { comment: FeedComment }) {
  return (
    <li className="feed-comment">
      <div>
        <strong>{comment.householdName ?? comment.authorName}</strong>
        <span>{formatDate(comment.createdAt)}</span>
      </div>
      <p>{comment.message}</p>
    </li>
  );
}

export function FeedItemCard({ item, onChanged }: Props) {
  const meta = FEED_TYPE_META[item.type];
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(item.comments.length > 0);
  const [isReacting, setIsReacting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const showStatus = supportsStatus(item.type);
  const commentCountLabel = item.comments.length === 1 ? '1 Kommentar' : `${item.comments.length} Kommentare`;

  async function handleReaction() {
    setIsReacting(true);
    setMessage(null);
    try {
      await toggleFeedReaction(item.id);
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reaktion konnte nicht gespeichert werden.');
    } finally {
      setIsReacting(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = comment.trim();
    if (!normalized) {
      setMessage('Kommentar darf nicht leer sein.');
      return;
    }
    setIsCommenting(true);
    setMessage(null);
    try {
      await addFeedComment(item.id, normalized);
      setComment('');
      setIsReplyOpen(true);
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kommentar konnte nicht gespeichert werden.');
    } finally {
      setIsCommenting(false);
    }
  }

  async function handleStatusToggle() {
    setIsUpdatingStatus(true);
    setMessage(null);
    try {
      await updateFeedStatus(item.id, item.status === 'done' ? 'open' : 'done');
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Status konnte nicht gespeichert werden.');
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <article className="feed-card" data-status={showStatus ? item.status : 'neutral'}>
      <div className="feed-card-main">
        <IconBadge emoji={meta.emoji} tint={meta.tint} />
        <div className="feed-card-copy">
          <p>
            <strong>{item.householdName}</strong>
            <span>·</span>
            <span>{meta.label}</span>
            {showStatus && (
              <span className={`feed-status feed-status--${item.status}`}>
                {item.status === 'done' ? 'Erledigt' : 'Offen'}
              </span>
            )}
          </p>
          {item.message && <p>{item.message}</p>}
          <small>
            {visibilityLabel(item.visibility)} · {formatDate(item.createdAt)}
            {item.expiresAt ? ` · bis ${formatDate(item.expiresAt)}` : ''}
          </small>
        </div>
      </div>

      <div className="feed-actions">
        <button type="button" data-active={item.reactedByMe} disabled={isReacting} onClick={handleReaction}>
          {item.reactedByMe ? '♥' : '♡'} {item.reactionCount}
        </button>
        <button type="button" data-active={isReplyOpen} onClick={() => setIsReplyOpen((open) => !open)}>
          {commentCountLabel}
        </button>
        {showStatus && item.canManage && (
          <button type="button" disabled={isUpdatingStatus} onClick={handleStatusToggle}>
            {item.status === 'done' ? 'Wieder öffnen' : 'Als erledigt markieren'}
          </button>
        )}
      </div>

      {isReplyOpen && (
        <div className="feed-replies">
          {item.comments.length > 0 ? (
            <ul className="feed-comments">
              {item.comments.map((entry) => (
                <FeedCommentRow key={entry.id} comment={entry} />
              ))}
            </ul>
          ) : (
            <p className="feed-comments-empty">Noch keine Antworten. Schreib die erste Rückmeldung.</p>
          )}

          <form className="feed-comment-form" onSubmit={handleCommentSubmit}>
            <Textarea
              placeholder="Antwort schreiben..."
              value={comment}
              rows={2}
              maxLength={500}
              onChange={(event) => setComment(event.target.value)}
              style={{ minHeight: 84 }}
            />
            <Button type="submit" variant="secondary" disabled={isCommenting}>
              {isCommenting ? 'Sendet...' : 'Antworten'}
            </Button>
          </form>
        </div>
      )}

      {message && <p className="feed-card-message">{message}</p>}
    </article>
  );
}
