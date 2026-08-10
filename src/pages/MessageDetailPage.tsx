import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { HouseholdAvatar } from '../components/atoms/HouseholdAvatar';
import { Button } from '../components/atoms/Button';
import { AdminEmptyState } from '../components/molecules/AdminEmptyState';
import { fetchConversation, sendMessage } from '../api/messageApi';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import type { Conversation, Message } from '../types/message';

const POLL_INTERVAL_MS = 5000;

function formatBubbleTime(iso: string): string {
  const date = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(0);

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
              <HouseholdAvatar avatarKey={conversation.peerHouseholdAvatarKey} fallback={conversation.peerHouseholdName ?? '?'} size={36} />
              <strong>{conversation.peerHouseholdName ?? 'Unbekannter Haushalt'}</strong>
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
              const isMine = message.senderHouseholdId !== null && message.senderHouseholdId === user?.householdId;
              return (
                <div key={message.id} className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                  <div className="chat-bubble">
                    {!isMine && <span className="chat-bubble-sender">{message.senderDisplayName}</span>}
                    <p>{message.body}</p>
                    <time>{formatBubbleTime(message.createdAt)}</time>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          className="chat-input-field"
          placeholder="Nachricht schreiben..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={2000}
        />
        <button type="submit" className="chat-send-btn" disabled={draft.trim() === '' || isSending} aria-label="Senden">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </DashboardTemplate>
  );
}
