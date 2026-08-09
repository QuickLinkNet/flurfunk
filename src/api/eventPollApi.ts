import { apiRequest } from './client';
import type { EventPoll, EventPollVoteInput, NewEventPollInput } from '../types/eventPoll';
import type { PushSendResult } from '../types/push';

export function fetchEventPolls() {
  return apiRequest<EventPoll[]>('/event-polls');
}

export function fetchEventPoll(id: number) {
  return apiRequest<EventPoll>(`/event-polls/${id}`);
}

export function createEventPoll(input: NewEventPollInput) {
  return apiRequest<{ id: number; push: PushSendResult | null }>('/event-polls', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function voteEventPoll(id: number, votes: EventPollVoteInput[]) {
  return apiRequest<EventPoll>(`/event-polls/${id}/vote`, { method: 'POST', body: JSON.stringify({ votes }) });
}

export function finalizeEventPoll(id: number, optionId: number) {
  return apiRequest<{ eventId: number; push: PushSendResult | null }>(`/event-polls/${id}/finalize`, {
    method: 'POST',
    body: JSON.stringify({ optionId })
  });
}

export function deleteEventPoll(id: number) {
  return apiRequest<null>(`/event-polls/${id}`, { method: 'DELETE' });
}
