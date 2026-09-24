import { RecipeCard } from '../molecules/RecipeCard';
import type { Recipe } from '../../types/recipe';

interface Props {
  recipes: Recipe[];
  emptyTitle?: string;
  emptyText?: string;
}

export function RecipeGrid({
  recipes,
  emptyTitle = 'Noch keine Rezepte',
  emptyText = 'Sei die erste Nachbarin, der erste Nachbar mit einem geteilten Rezept.'
}: Props) {
  if (recipes.length === 0) {
    return (
      <div className="recipe-empty">
        <strong>{emptyTitle}</strong>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
