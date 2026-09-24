import { apiRequest } from './client';
import type { ShoppingListItem } from '../types/shoppingListItem';

export function fetchShoppingList() {
  return apiRequest<ShoppingListItem[]>('/shopping-list');
}

export function createShoppingListItem(label: string, quantity?: string) {
  return apiRequest<{ id: number }>('/shopping-list', { method: 'POST', body: JSON.stringify({ label, quantity }) });
}

export function updateShoppingListItemDone(id: number, isDone: boolean) {
  return apiRequest<null>(`/shopping-list/${id}`, { method: 'PUT', body: JSON.stringify({ isDone }) });
}

export function deleteShoppingListItem(id: number) {
  return apiRequest<null>(`/shopping-list/${id}`, { method: 'DELETE' });
}

export function clearDoneShoppingListItems() {
  return apiRequest<null>('/shopping-list/clear-done', { method: 'POST' });
}
