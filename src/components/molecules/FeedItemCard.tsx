import { useState, type FormEvent } from 'react';
import { IconBadge } from '../atoms/IconBadge';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { ActionDialog } from './ActionDialog';
import { PhotoPickerField } from './PhotoPickerField';
import {
  addFeedComment,
  borrowFeedItem,
  deleteFeedPhoto,
  returnFeedItem,
  toggleFeedHelper,
  toggleFeedReaction,
  updateFeedItem,
  updateFeedStatus,
  uploadFeedPhoto,
  voteOnFeedPoll
} from '../../api/feedApi';
import { FEED_TYPE_META } from '../../utils/feedTypeMeta';
import type { FeedComment, FeedItem, FeedItemType } from '../../types/feedItem';

interface Props {
  item: FeedItem;
  onChanged: () => void;
}

const STATUS_TYPES: FeedItemType[] = ['help_needed', 'tool_available', 'babysitter_needed', 'package_received', 'marketplace_sell', 'marketplace_give'];
const HELPER_TYPES: FeedItemType[] = ['help_needed', 'babysitter_needed'];
const LOAN_TYPES: FeedItemType[] = ['tool_available', 'marketplace_sell', 'marketplace_give'];
const MARKET_TYPES: FeedItemType[] = ['marketplace_sell', 'marketplace_give'];

function isMarketplace(type: FeedItemType): boolean {
  return MARKET_TYPES.includes(type);
}

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

function supportsHelpers(type: FeedItemType): boolean {
  return HELPER_TYPES.includes(type);
}

function supportsLoan(type: FeedItemType): boolean {
  return LOAN_TYPES.includes(type);
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
  const [isHelping, setIsHelping] = useState(false);
  const [isLoanBusy, setIsLoanBusy] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoTouched, setEditPhotoTouched] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const isPoll = item.type === 'poll';
  const showStatus = supportsStatus(item.type);
  const showHelpers = supportsHelpers(item.type);
  const showLoan = supportsLoan(item.type);
  const marketplace = isMarketplace(item.type);
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

  async function handleHelperToggle() {
    setIsHelping(true);
    setMessage(null);
    try {
      await toggleFeedHelper(item.id);
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Hilfe-Zusage konnte nicht gespeichert werden.');
    } finally {
      setIsHelping(false);
    }
  }

  async function handleBorrow() {
    setIsLoanBusy(true);
    setMessage(null);
    try {
      await borrowFeedItem(item.id);
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Konnte nicht als ${marketplace ? 'reserviert' : 'ausgeliehen'} markiert werden.`);
    } finally {
      setIsLoanBusy(false);
    }
  }

  async function handleReturn() {
    setIsLoanBusy(true);
    setMessage(null);
    try {
      await returnFeedItem(item.id);
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Konnte nicht als ${marketplace ? 'wieder frei' : 'zurückgegeben'} markiert werden.`);
    } finally {
      setIsLoanBusy(false);
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

  async function handleVote(optionId: number) {
    setIsVoting(true);
    setMessage(null);
    try {
      await voteOnFeedPoll(item.id, optionId);
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Stimme konnte nicht gespeichert werden.');
    } finally {
      setIsVoting(false);
    }
  }

  function openEdit() {
    setEditMessage(item.message ?? '');
    setEditPhotoFile(null);
    setEditPhotoTouched(false);
    setEditError(null);
    setIsEditOpen(true);
  }

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = editMessage.trim();
    if (isPoll && !trimmed) {
      setEditError('Die Frage darf nicht leer sein.');
      return;
    }
    setIsSavingEdit(true);
    setEditError(null);
    try {
      await updateFeedItem(item.id, trimmed || null);
      if (editPhotoTouched) {
        if (editPhotoFile) {
          await uploadFeedPhoto(item.id, editPhotoFile);
        } else if (item.photoUrl) {
          await deleteFeedPhoto(item.id);
        }
      }
      setIsEditOpen(false);
      onChanged();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Änderungen konnten nicht gespeichert werden.');
    } finally {
      setIsSavingEdit(false);
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
          {item.photoUrl && (
            <img className="feed-card-photo" src={item.photoUrl} alt="" loading="lazy" />
          )}
          {item.type === 'poll' && item.poll && (
            <div className="feed-poll">
              {item.poll.options.map((option) => {
                const pct = item.poll!.totalVotes > 0 ? Math.round((option.voteCount / item.poll!.totalVotes) * 100) : 0;
                const isMine = item.poll!.myOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className="feed-poll-option"
                    data-active={isMine}
                    disabled={isVoting}
                    onClick={() => handleVote(option.id)}
                  >
                    <span className="feed-poll-option-bar" style={{ width: `${pct}%` }} />
                    <span className="feed-poll-option-label">{option.label}{isMine ? ' ✓' : ''}</span>
                    <span className="feed-poll-option-pct">{pct}% ({option.voteCount})</span>
                  </button>
                );
              })}
              <small>{item.poll.totalVotes} Stimme{item.poll.totalVotes === 1 ? '' : 'n'}</small>
            </div>
          )}
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
        {showHelpers && !item.canManage && (
          <button type="button" data-active={item.helpingByMe} disabled={isHelping} onClick={handleHelperToggle}>
            🤝 {item.helpingByMe ? 'Ich helfe' : 'Ich kann helfen'}
          </button>
        )}
        {showLoan && !item.loan && !item.canManage && (
          <button type="button" disabled={isLoanBusy} onClick={handleBorrow}>
            {marketplace ? '🙋 Reservieren' : '📦 Ausleihen'}
          </button>
        )}
        {showLoan && item.loan && (item.loanedByMe || item.canManage) && (
          <button type="button" data-active disabled={isLoanBusy} onClick={handleReturn}>
            {marketplace ? '🙋 Reservierung aufheben' : '📦 Zurückgeben'}
          </button>
        )}
        {showStatus && item.canManage && (
          <button type="button" disabled={isUpdatingStatus} onClick={handleStatusToggle}>
            {item.status === 'done'
              ? (marketplace ? 'Wieder verfügbar' : 'Wieder öffnen')
              : (marketplace ? (item.type === 'marketplace_sell' ? 'Als verkauft markieren' : 'Als verschenkt markieren') : 'Als erledigt markieren')}
          </button>
        )}
        {item.canManage && (
          <button type="button" onClick={openEdit}>
            ✏️ Bearbeiten
          </button>
        )}
      </div>

      {showHelpers && (item.helpers?.length ?? 0) > 0 && (
        <p className="feed-helpers">
          Hilft: {item.helpers.map((helper) => helper.householdName ?? 'Nachbar').join(', ')}
        </p>
      )}

      {showLoan && item.loan && (
        <p className="feed-helpers">
          {marketplace ? 'Reserviert von' : 'Ausgeliehen an'} {item.loan.householdName ?? 'Nachbar'} seit {formatDate(item.loan.borrowedAt)}
        </p>
      )}

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

      <ActionDialog open={isEditOpen} title="Meldung bearbeiten" onClose={() => setIsEditOpen(false)}>
        <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: 'var(--md-space-3)' }}>
          <Textarea
            placeholder={FEED_TYPE_META[item.type].template}
            value={editMessage}
            rows={3}
            maxLength={280}
            onChange={(event) => setEditMessage(event.target.value)}
          />
          <PhotoPickerField
            initialUrl={item.photoUrl}
            onFileSelected={(file) => {
              setEditPhotoFile(file);
              setEditPhotoTouched(true);
            }}
          />
          <Button type="submit" disabled={isSavingEdit}>
            {isSavingEdit ? 'Speichert...' : 'Speichern'}
          </Button>
          {editError && <p className="feed-card-message">{editError}</p>}
        </form>
      </ActionDialog>
    </article>
  );
}
