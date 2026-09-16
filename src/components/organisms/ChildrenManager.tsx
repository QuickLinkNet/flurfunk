import { useEffect, useState, type FormEvent } from 'react';
import { ChildRow } from '../molecules/ChildRow';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { EditEntityDialog } from '../molecules/EditEntityDialog';
import { fetchChildren, createChild, deleteChild, updateChildLocation, updateChildDetails } from '../../api/childrenApi';
import type { Child, ChildLocation } from '../../types/child';

const TODAY_ISO = new Date().toISOString().slice(0, 10);

interface Props {
  compact?: boolean;
}

export function ChildrenManager({ compact = false }: Props) {
  const [children, setChildren] = useState<Child[]>([]);
  const [newName, setNewName] = useState('');
  const [newBirthdate, setNewBirthdate] = useState('');
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function reload() {
    fetchChildren().then(setChildren).catch(() => setChildren([]));
  }

  useEffect(reload, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createChild(newName.trim(), newBirthdate || undefined);
    setNewName('');
    setNewBirthdate('');
    reload();
  }

  async function handleLocationChange(childId: number, location: ChildLocation) {
    setChildren((prev) => prev.map((c) => (c.id === childId ? { ...c, currentLocation: location } : c)));
    await updateChildLocation(childId, location);
  }

  async function handleDelete() {
    if (!deletingChild) return;
    setIsDeleting(true);
    try {
      await deleteChild(deletingChild.id);
      setDeletingChild(null);
      reload();
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveChild(name: string, _type?: string, birthdate?: string) {
    if (!editingChild) return;
    if (name === editingChild.name && (birthdate ?? '') === (editingChild.birthdate ?? '')) {
      setEditingChild(null);
      return;
    }
    setIsEditing(true);
    try {
      await updateChildDetails(editingChild.id, name, birthdate || null);
      setEditingChild(null);
      reload();
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <section className={compact ? 'onboarding-subsection compact-manager' : 'compact-manager'}>
      <div>
        <h3>Kinder</h3>
        <p>Optional. Der Status hilft Nachbarn nur, wenn ihr ihn nutzen möchtet.</p>
      </div>
      <div className="compact-list">
        {children.map((child) => (
          <ChildRow
            key={child.id}
            child={child}
            onLocationChange={handleLocationChange}
            onRename={setEditingChild}
            onDelete={() => setDeletingChild(child)}
          />
        ))}
        {children.length === 0 && <p className="empty-note">Noch keine Kinder angelegt.</p>}
      </div>
      <form onSubmit={handleAdd} className="compact-form">
        <Input placeholder="Name des Kindes" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Input
          type="date"
          aria-label="Geburtstag (optional)"
          value={newBirthdate}
          max={TODAY_ISO}
          onChange={(e) => setNewBirthdate(e.target.value)}
        />
        <Button type="submit">Hinzufügen</Button>
      </form>
      <EditEntityDialog
        open={Boolean(editingChild)}
        title="Kind bearbeiten"
        nameLabel="Name des Kindes"
        initialName={editingChild?.name ?? ''}
        dateLabel="Geburtstag (optional) - taucht am Tag selbst in der Nachbarschaft und im Kalender auf"
        dateValue={editingChild?.birthdate ?? ''}
        loading={isEditing}
        onClose={() => setEditingChild(null)}
        onSave={handleSaveChild}
      />
      <ConfirmDialog
        open={Boolean(deletingChild)}
        title="Kind entfernen"
        description={`Soll ${deletingChild?.name ?? 'dieses Kind'} wirklich aus eurem Haushalt entfernt werden?`}
        confirmLabel="Entfernen"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingChild(null)}
      />
    </section>
  );
}
