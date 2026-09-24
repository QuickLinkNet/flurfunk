import { apiRequest, apiUpload } from './client';
import type { Recipe, RecipeComment, RecipeDifficulty, RecipeTag } from '../types/recipe';

export function fetchRecipes(tag?: RecipeTag) {
  return apiRequest<Recipe[]>(`/recipes${tag ? `?tag=${tag}` : ''}`);
}

export function fetchRecipe(id: number) {
  return apiRequest<Recipe>(`/recipes/${id}`);
}

export interface RecipeInput {
  title: string;
  description?: string;
  ingredients: string;
  steps: string;
  prepMinutes?: number | null;
  servings?: number | null;
  difficulty: RecipeDifficulty;
  tags: RecipeTag[];
}

export function createRecipe(input: RecipeInput) {
  return apiRequest<{ id: number }>('/recipes', { method: 'POST', body: JSON.stringify(input) });
}

export function updateRecipe(id: number, input: RecipeInput) {
  return apiRequest<Recipe>(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteRecipe(id: number) {
  return apiRequest<null>(`/recipes/${id}`, { method: 'DELETE' });
}

export function uploadRecipePhoto(id: number, file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  return apiUpload<{ photoUrl: string }>(`/recipes/${id}/photo`, formData);
}

export function deleteRecipePhoto(id: number) {
  return apiRequest<null>(`/recipes/${id}/photo`, { method: 'DELETE' });
}

export function toggleRecipeReaction(id: number) {
  return apiRequest<{ reactedByMe: boolean; reactionCount: number }>(`/recipes/${id}/reaction`, { method: 'POST' });
}

export function addRecipeComment(id: number, message: string) {
  return apiRequest<RecipeComment[]>(`/recipes/${id}/comments`, { method: 'POST', body: JSON.stringify({ message }) });
}
