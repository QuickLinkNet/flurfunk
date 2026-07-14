import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import { CardRow } from '../molecules/CardRow';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { EditEntityDialog } from '../molecules/EditEntityDialog';
import { fetchPets, createPet, deletePet, updatePet } from '../../api/petsApi';
import { PET_TYPE_LABELS } from '../../types/pet';
import type { Pet, PetType } from '../../types/pet';

interface Props {
  compact?: boolean;
}

export function PetsManager({ compact = false }: Props) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('dog');
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function reload() {
    fetchPets().then(setPets).catch(() => setPets([]));
  }

  useEffect(reload, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createPet(name.trim(), type);
    setName('');
    reload();
  }

  async function handleDelete() {
    if (!deletingPet) return;
    setIsDeleting(true);
    try {
      await deletePet(deletingPet.id);
      setDeletingPet(null);
      reload();
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleEdit(nextName: string, nextType?: string) {
    if (!editingPet) return;
    const petType = (nextType ?? editingPet.type) as PetType;
    if (nextName === editingPet.name && petType === editingPet.type) {
      setEditingPet(null);
      return;
    }
    setIsEditing(true);
    try {
      await updatePet(editingPet.id, nextName, petType);
      setEditingPet(null);
      reload();
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <section className={compact ? 'onboarding-subsection compact-manager' : 'compact-manager'}>
      <div>
        <h3>Haustiere</h3>
        <p>Optional. Nützlich, falls Nachbarn euch bei Tür, Garten oder Betreuung helfen.</p>
      </div>
      <div className="compact-list">
        {pets.map((pet) => (
          <CardRow
            key={pet.id}
            action={
              <div className="inline-actions">
                <Button type="button" variant="ghost" onClick={() => setEditingPet(pet)}>
                  Bearbeiten
                </Button>
                <Button type="button" variant="ghost" onClick={() => setDeletingPet(pet)}>
                  Entfernen
                </Button>
              </div>
            }
          >
            <span style={{ fontSize: 'var(--md-font-size-md)', fontWeight: 'var(--md-font-weight-medium)' }}>
              {PET_TYPE_LABELS[pet.type]} {pet.name}
            </span>
          </CardRow>
        ))}
        {pets.length === 0 && <p className="empty-note">Noch keine Haustiere angelegt.</p>}
      </div>
      <form onSubmit={handleAdd} className="compact-form">
        <Input placeholder="Name des Haustiers" value={name} onChange={(e) => setName(e.target.value)} />
        <Select value={type} onChange={(e) => setType(e.target.value as PetType)} style={{ width: 150 }}>
          {(Object.keys(PET_TYPE_LABELS) as PetType[]).map((value) => (
            <option key={value} value={value}>
              {PET_TYPE_LABELS[value]}
            </option>
          ))}
        </Select>
        <Button type="submit">Hinzufügen</Button>
      </form>
      <EditEntityDialog
        open={Boolean(editingPet)}
        title="Haustier bearbeiten"
        nameLabel="Name des Haustiers"
        initialName={editingPet?.name ?? ''}
        typeValue={editingPet?.type ?? 'dog'}
        typeOptions={(Object.keys(PET_TYPE_LABELS) as PetType[]).map((value) => ({ value, label: PET_TYPE_LABELS[value] }))}
        loading={isEditing}
        onClose={() => setEditingPet(null)}
        onSave={handleEdit}
      />
      <ConfirmDialog
        open={Boolean(deletingPet)}
        title="Haustier entfernen"
        description={`Soll ${deletingPet?.name ?? 'dieses Haustier'} wirklich aus eurem Haushalt entfernt werden?`}
        confirmLabel="Entfernen"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPet(null)}
      />
    </section>
  );
}
