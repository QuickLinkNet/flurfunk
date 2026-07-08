export type PetType = 'dog' | 'cat' | 'other';

export interface Pet {
  id: number;
  name: string;
  type: PetType;
}

export const PET_TYPE_LABELS: Record<PetType, string> = {
  dog: '🐕 Hund',
  cat: '🐈 Katze',
  other: '🐾 Sonstiges'
};
