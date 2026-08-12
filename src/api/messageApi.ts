import { apiRequest, apiUpload } from './client';
import type { Conversation, ConversationDetail, Message } from '../types/message';
import type { PushSendResult } from '../types/push';

export function fetchConversations() {
  return apiRequest<Conversation[]>('/messages');
}

export function fetchUnreadMessageCount() {
  return apiRequest<{ count: number }>('/messages/unread-count');
}

export function fetchConversation(id: number) {
  return apiRequest<ConversationDetail>(`/messages/${id}`);
}

export function startConversation(userId: number) {
  return apiRequest<Conversation>('/messages', {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export function sendMessage(conversationId: number, body: string) {
  return apiRequest<{ message: Message; push: PushSendResult | null }>(`/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ body })
  });
}

export function sendVoiceMessage(conversationId: number, blob: Blob, durationSeconds: number) {
  const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
  const formData = new FormData();
  formData.append('audio', blob, `voice.${extension}`);
  formData.append('duration', String(Math.round(durationSeconds)));
  return apiUpload<{ message: Message; push: PushSendResult | null }>(`/messages/${conversationId}/voice`, formData);
}
