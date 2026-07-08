import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import { fetchPets, createPet, deletePet } from '../../api/petsApi';
import { PET_TYPE_LABELS } from '../../types/pet';
import type { Pet, PetType } from '../../types/pet';

export function PetsManager() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('dog');

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

  async function handleDelete(id: number) {
    await deletePet(id);
    reload();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pets.map((pet) => (
          <div
            key={pet.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 'var(--md-radius-control)',
              background: 'var(--md-color-surface)',
              border: '1px solid var(--md-color-border)'
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {PET_TYPE_LABELS[pet.type]} {pet.name}
            </span>
            <Button variant="ghost" onClick={() => handleDelete(pet.id)}>
              Entfernen
            </Button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
        <Input placeholder="Name des Haustiers" value={name} onChange={(e) => setName(e.target.value)} />
        <Select value={type} onChange={(e) => setType(e.target.value as PetType)} style={{ width: 140 }}>
          {(Object.keys(PET_TYPE_LABELS) as PetType[]).map((value) => (
            <option key={value} value={value}>
              {PET_TYPE_LABELS[value]}
            </option>
          ))}
        </Select>
        <Button type="submit">Hinzufügen</Button>
      </form>
    </div>
  );
}
