export interface ShoppingListItem {
  id: number;
  label: string;
  quantity: string | null;
  isDone: boolean;
  createdAt: string;
}
