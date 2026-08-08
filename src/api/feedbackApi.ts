import { apiRequest } from './client';
import type { FeedbackSubmitInput } from '../types/feedback';
import type { PushSendResult } from '../types/push';

export function submitFeedback(input: FeedbackSubmitInput) {
  return apiRequest<{ id: number; push: PushSendResult | null }>('/feedback', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
