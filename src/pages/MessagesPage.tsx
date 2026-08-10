import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { HouseholdAvatar } from '../components/atoms/HouseholdAvatar';
import { FeatureIcon } from '../components/atoms/FeatureIcon';
import { fetchConversations } from '../api/messageApi';
import { useMessages } from '../hooks/useMessages';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { Conversation } from '../types/message';

const POLL_INTERVAL_MS = 20000;

function formatConversationTime(iso: string): string {
  const date = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  const diffDays = Math.round((now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  }
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshUnreadCount } = useMessages();

  useEffect(() => {
    let isMounted = true;

    function load() {
      fetchConversations()
        .then((items) => {
          if (!isMounted) return;
          setConversations(items);
          setMessage(null);
          setIsLoading(false);
          refreshUnreadCount();
        })
        .catch((error) => {
          if (!isMounted) return;
          setMessage(error instanceof Error ? error.message : 'Nachrichten konnten nicht geladen werden.');
          setIsLoading(false);
        });
    }

    load();
    const interval = window.setInterval(load, POLL_INTERVAL_MS);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.messages.title} pageSubtitle={PAGE_HEADERS.messages.subtitle}>
      {message && <p className="neighbors-empty">{message}</p>}

      {!message && !isLoading && conversations.length === 0 && (
        <div className="messages-empty">
          <span className="messages-empty-icon">
            <FeatureIcon name="chat" size={56} />
          </span>
          <strong>Noch keine Nachrichten</strong>
          <p>Schreib einer Nachbarin oder einem Nachbarn - auf der <Link to="/nachbarn">Nachbarn-Seite</Link> gibt es dafür einen Button.</p>
        </div>
      )}

      {conversations.length > 0 && (
        <div className="messages-list">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/nachrichten/${conversation.id}`}
              className="messages-list-row"
              data-unread={conversation.unread}
            >
              <HouseholdAvatar avatarKey={conversation.peerHouseholdAvatarKey} fallback={conversation.peerHouseholdName ?? '?'} size={44} />
              <div className="messages-list-main">
                <div className="messages-list-top">
                  <strong>{conversation.peerHouseholdName ?? 'Unbekannter Haushalt'}</strong>
                  {conversation.lastMessageAt && <time>{formatConversationTime(conversation.lastMessageAt)}</time>}
                </div>
                <p>{conversation.lastMessageBody ?? 'Noch keine Nachricht'}</p>
              </div>
              {conversation.unread && <span className="messages-list-dot" aria-hidden="true" />}
            </Link>
          ))}
        </div>
      )}
    </DashboardTemplate>
  );
}
