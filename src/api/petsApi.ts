import { apiRequest } from './client';
import type { Pet, PetType } from '../types/pet';

export function fetchPets() {
  return apiRequest<Pet[]>('/pets');
}

export function createPet(name: string, type: PetType) {
  return apiRequest<{ id: number }>('/pets', { method: 'POST', body: JSON.stringify({ name, type }) });
}

export function updatePet(id: number, name: string, type: PetType) {
  return apiRequest<null>(`/pets/${id}`, { method: 'PUT', body: JSON.stringify({ name, type }) });
}

export function deletePet(id: number) {
  return apiRequest<null>(`/pets/${id}`, { method: 'DELETE' });
}
