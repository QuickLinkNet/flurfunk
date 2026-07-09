import { useEffect, useState, type FormEvent } from 'react';
import { ChildRow } from '../molecules/ChildRow';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { fetchChildren, createChild, updateChildLocation } from '../../api/childrenApi';
import type { Child, ChildLocation } from '../../types/child';

export function ChildrenManager() {
  const [children, setChildren] = useState<Child[]>([]);
  const [newName, setNewName] = useState('');

  function reload() {
    fetchChildren().then(setChildren).catch(() => setChildren([]));
  }

  useEffect(reload, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createChild(newName.trim());
    setNewName('');
    reload();
  }

  async function handleLocationChange(childId: number, location: ChildLocation) {
    setChildren((prev) => prev.map((c) => (c.id === childId ? { ...c, currentLocation: location } : c)));
    await updateChildLocation(childId, location);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-3)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
        {children.map((child) => (
          <ChildRow key={child.id} child={child} onLocationChange={handleLocationChange} />
        ))}
      </div>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--md-space-2)' }}>
        <Input placeholder="Name des Kindes" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button type="submit">Hinzufügen</Button>
      </form>
    </div>
  );
}
