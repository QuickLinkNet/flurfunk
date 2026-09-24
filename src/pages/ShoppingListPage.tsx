import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { CardRow } from '../components/molecules/CardRow';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import {
  clearDoneShoppingListItems,
  createShoppingListItem,
  deleteShoppingListItem,
  fetchShoppingList,
  updateShoppingListItemDone
} from '../api/shoppingListApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import type { ShoppingListItem } from '../types/shoppingListItem';

export function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [label, setLabel] = useState('');
  const [quantity, setQuantity] = useState('');

  const reload = useCallback(() => {
    fetchShoppingList().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => reload(), [reload]);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    await createShoppingListItem(label.trim(), quantity.trim() || undefined);
    setLabel('');
    setQuantity('');
    reload();
  }

  async function handleToggle(item: ShoppingListItem) {
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, isDone: !entry.isDone } : entry)));
    await updateShoppingListItemDone(item.id, !item.isDone);
  }

  async function handleDelete(itemId: number) {
    setItems((current) => current.filter((entry) => entry.id !== itemId));
    await deleteShoppingListItem(itemId);
  }

  async function handleClearDone() {
    await clearDoneShoppingListItems();
    reload();
  }

  const hasDone = items.some((item) => item.isDone);

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.shoppingList.title} pageSubtitle={PAGE_HEADERS.shoppingList.subtitle}>
      <section className="compact-manager">
        <div className="compact-list">
          {items.map((item) => (
            <CardRow
              key={item.id}
              action={
                <Button type="button" variant="ghost" onClick={() => handleDelete(item.id)}>
                  Entfernen
                </Button>
              }
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-space-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={item.isDone} onChange={() => handleToggle(item)} />
                <span style={{ textDecoration: item.isDone ? 'line-through' : 'none', opacity: item.isDone ? 0.6 : 1 }}>
                  {item.label}
                  {item.quantity ? ` · ${item.quantity}` : ''}
                </span>
              </label>
            </CardRow>
          ))}
          {items.length === 0 && <p className="empty-note">Die Liste ist leer.</p>}
        </div>

        <form onSubmit={handleAdd} className="compact-form">
          <Input placeholder="Was brauchst du?" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="Menge (optional)" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ flex: '0 1 140px' }} />
          <Button type="submit">Hinzufügen</Button>
        </form>

        {hasDone && (
          <Button type="button" variant="ghost" onClick={handleClearDone}>
            Erledigte löschen
          </Button>
        )}
      </section>
    </DashboardTemplate>
  );
}
