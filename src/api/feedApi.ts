import { apiRequest } from './client';
import type { FeedItem, FeedItemType } from '../types/feedItem';
import type { PushSendResult } from '../types/push';

export function fetchFeed() {
  return apiRequest<FeedItem[]>('/feed');
}

interface NewFeedItem {
  type: FeedItemType;
  message?: string;
  visibility?: 'public' | 'neighbors' | 'private';
  expiresAt?: string;
}

export function createFeedItem(item: NewFeedItem) {
  return apiRequest<{ id: number; push: PushSendResult | null }>('/feed', { method: 'POST', body: JSON.stringify(item) });
}
