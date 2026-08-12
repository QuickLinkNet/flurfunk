import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { UserAvatar } from '../components/atoms/UserAvatar';
import { Button } from '../components/atoms/Button';
import { AdminEmptyState } from '../components/molecules/AdminEmptyState';
import { fetchConversation, sendMessage, sendVoiceMessage } from '../api/messageApi';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import type { Conversation, Message } from '../types/message';

const POLL_INTERVAL_MS = 5000;

function formatBubbleTime(iso: string): string {
  const date = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatDayChip(iso: string): string {
  const date = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Heute';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Gestern';
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
}

export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const conversationId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshUnreadCount } = useMessages();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(0);
  const recorder = useVoiceRecorder();

  useEffect(() => {
    if (!Number.isFinite(conversationId)) {
      setNotFound(true);
      return;
    }
    let isMounted = true;

    function load() {
      fetchConversation(conversationId)
        .then((detail) => {
          if (!isMounted) return;
          setConversation(detail.conversation);
          setMessages(detail.messages);
          setError(null);
          refreshUnreadCount();
        })
        .catch((err) => {
          if (!isMounted) return;
          if (err instanceof Error && err.message.includes('nicht gefunden')) {
            setNotFound(true);
          } else {
            setError(err instanceof Error ? err.message : 'Unterhaltung konnte nicht geladen werden.');
          }
        });
    }

    load();
    const interval = window.setInterval(load, POLL_INTERVAL_MS);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > previousMessageCount.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
    previousMessageCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (recorder.error) setError(recorder.error);
  }, [recorder.error]);

  async function handleStopAndSendVoice() {
    const recording = await recorder.stop();
    if (!recording) return;
    setIsSendingVoice(true);
    try {
      const { message } = await sendVoiceMessage(conversationId, recording.blob, recording.durationSeconds);
      setMessages((current) => [...current, message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sprachnachricht konnte nicht gesendet werden.');
    } finally {
      setIsSendingVoice(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (body === '' || isSending) return;

    setIsSending(true);
    setDraft('');
    try {
      const { message } = await sendMessage(conversationId, body);
      setMessages((current) => [...current, message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nachricht konnte nicht gesendet werden.');
      setDraft(body);
    } finally {
      setIsSending(false);
    }
  }

  if (notFound) {
    return (
      <DashboardTemplate pageTitle="Nachrichten" pageSubtitle="Unterhaltung nicht gefunden.">
        <AdminEmptyState>Diese Unterhaltung gibt es nicht (mehr) oder du bist nicht Teil davon.</AdminEmptyState>
        <Button type="button" variant="ghost" onClick={() => navigate('/nachrichten')}>Zurück zur Übersicht</Button>
      </DashboardTemplate>
    );
  }

  const dayGroups: Array<{ day: string; items: Message[] }> = [];
  for (const message of messages) {
    const day = formatDayChip(message.createdAt);
    const lastGroup = dayGroups[dayGroups.length - 1];
    if (lastGroup && lastGroup.day === day) {
      lastGroup.items.push(message);
    } else {
      dayGroups.push({ day, items: [message] });
    }
  }

  return (
    <DashboardTemplate
      headerVariant="plain"
      shellClassName="chat-shell"
      contentClassName="chat-content"
      header={
        <div className="chat-header">
          <Link to="/nachrichten" className="chat-back" aria-label="Zurück zu Nachrichten">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          {conversation && (
            <>
              <UserAvatar
                photoUrl={conversation.peerAvatarPhotoUrl}
                avatarUrl={conversation.peerHouseholdAvatarKey}
                fallback={conversation.peerDisplayName ?? '?'}
                size={36}
              />
              <strong>{conversation.peerDisplayName ?? 'Unbekannte Person'}</strong>
            </>
          )}
        </div>
      }
    >
      {error && <p className="neighbors-empty">{error}</p>}

      <div className="chat-scroll" ref={scrollRef}>
        {dayGroups.map((group) => (
          <div key={group.day}>
            <div className="chat-day-chip"><span>{group.day}</span></div>
            {group.items.map((message) => {
              const isMine = message.senderUserId === user?.id;
              return (
                <div key={message.id} className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                  <div className={`chat-bubble ${message.audioUrl ? 'chat-bubble-audio' : ''}`}>
                    {!isMine && <span className="chat-bubble-sender">{message.senderDisplayName}</span>}
                    {message.audioUrl ? (
                      <>
                        <audio controls preload="none" src={message.audioUrl} />
                        {message.audioDurationSeconds !== null && (
                          <span className="chat-audio-duration">{formatDuration(message.audioDurationSeconds)}</span>
                        )}
                      </>
                    ) : (
                      <p>{message.body}</p>
                    )}
                    <time>{formatBubbleTime(message.createdAt)}</time>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {recorder.status === 'recording' ? (
        <div className="chat-record-bar">
          <button type="button" className="chat-record-cancel" onClick={recorder.cancel} aria-label="Aufnahme verwerfen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="chat-record-dot" aria-hidden="true" />
          <span className="chat-record-timer">{formatDuration(recorder.elapsedSeconds)}</span>
          <button type="button" className="chat-send-btn" onClick={handleStopAndSendVoice} disabled={isSendingVoice} aria-label="Sprachnachricht senden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      ) : (
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <input
            className="chat-input-field"
            placeholder="Nachricht schreiben..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={2000}
          />
          {draft.trim() === '' ? (
            <button
              type="button"
              className="chat-send-btn"
              onClick={recorder.start}
              disabled={recorder.status === 'requesting' || isSendingVoice}
              aria-label="Sprachnachricht aufnehmen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button type="submit" className="chat-send-btn" disabled={isSending} aria-label="Senden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
        </form>
      )}
    </DashboardTemplate>
  );
}
