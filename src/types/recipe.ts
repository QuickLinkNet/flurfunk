export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export type RecipeTag = 'schnell' | 'familie' | 'vegetarisch' | 'backen' | 'vegan' | 'gesund';

export const RECIPE_TAG_LABELS: Record<RecipeTag, string> = {
  schnell: 'Schnell',
  familie: 'Familie',
  vegetarisch: 'Vegetarisch',
  backen: 'Backen',
  vegan: 'Vegan',
  gesund: 'Gesund'
};

export const RECIPE_DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy: 'Einfach',
  medium: 'Mittel',
  hard: 'Anspruchsvoll'
};

export interface RecipeComment {
  id: number;
  householdName: string | null;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  ingredients: string;
  steps: string;
  photoUrl: string | null;
  prepMinutes: number | null;
  servings: number | null;
  difficulty: RecipeDifficulty;
  tags: RecipeTag[];
  householdName: string;
  householdAvatarKey: string | null;
  createdAt: string;
  commentCount: number;
  reactionCount: number;
  reactedByMe: boolean;
  canManage: boolean;
  comments?: RecipeComment[];
}
