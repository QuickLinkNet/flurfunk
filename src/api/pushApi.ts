import { apiRequest } from './client';

export function fetchVapidPublicKey() {
  return apiRequest<{ publicKey: string }>('/push/vapid-public-key');
}

export function fetchPushStatus() {
  return apiRequest<{ subscribed: boolean }>('/push/status');
}

export function subscribePush(subscription: PushSubscriptionJSON) {
  return apiRequest<null>('/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
}

export function unsubscribePush(endpoint: string) {
  return apiRequest<null>('/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint }) });
}

export function sendTestPush() {
  return apiRequest<{ sent: number; total: number }>('/push/test', { method: 'POST' });
}
