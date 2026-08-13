import { apiRequest, apiUpload } from './client';
import type { FeedComment, FeedHelper, FeedItem, FeedItemType, FeedLoan, FeedPoll } from '../types/feedItem';
import type { PushSendResult } from '../types/push';

export function fetchFeed() {
  return apiRequest<FeedItem[]>('/feed');
}

interface NewFeedItem {
  type: FeedItemType;
  message?: string;
  visibility?: 'public' | 'neighbors' | 'private';
  expiresAt?: string;
  options?: string[];
}

export function createFeedItem(item: NewFeedItem) {
  return apiRequest<{ id: number; push: PushSendResult | null }>('/feed', { method: 'POST', body: JSON.stringify(item) });
}

export function voteOnFeedPoll(itemId: number, optionId: number) {
  return apiRequest<{ poll: FeedPoll }>(`/feed/${itemId}/poll-vote`, {
    method: 'POST',
    body: JSON.stringify({ optionId })
  });
}

export function uploadFeedPhoto(itemId: number, file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  return apiUpload<{ photoUrl: string }>(`/feed/${itemId}/photo`, formData);
}

export function deleteFeedPhoto(itemId: number) {
  return apiRequest<null>(`/feed/${itemId}/photo`, { method: 'DELETE' });
}

export function toggleFeedReaction(id: number) {
  return apiRequest<{ reactedByMe: boolean; reactionCount: number }>(`/feed/${id}/reaction`, { method: 'POST' });
}

export function addFeedComment(id: number, message: string) {
  return apiRequest<FeedComment[]>(`/feed/${id}/comments`, { method: 'POST', body: JSON.stringify({ message }) });
}

export function updateFeedStatus(id: number, status: FeedItem['status']) {
  return apiRequest<{ status: FeedItem['status'] }>(`/feed/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export function toggleFeedHelper(id: number) {
  return apiRequest<{ helpingByMe: boolean; helpers: FeedHelper[] }>(`/feed/${id}/helpers`, { method: 'POST' });
}

export function borrowFeedItem(id: number) {
  return apiRequest<{ loan: FeedLoan }>(`/feed/${id}/loan`, { method: 'POST' });
}

export function returnFeedItem(id: number) {
  return apiRequest<{ loan: null }>(`/feed/${id}/loan/return`, { method: 'POST' });
}
