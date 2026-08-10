import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { fetchUnreadMessageCount } from '../api/messageApi';
import { useAuth } from '../hooks/useAuth';

const POLL_INTERVAL_MS = 20000;

interface MessagesContextValue {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

export const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isLoggedIn = Boolean(user);
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;

  const refreshUnreadCount = useCallback(() => {
    if (!isLoggedInRef.current) return;
    fetchUnreadMessageCount()
      .then(({ count }) => setUnreadCount(count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [isLoggedIn, refreshUnreadCount]);

  return (
    <MessagesContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </MessagesContext.Provider>
  );
}
