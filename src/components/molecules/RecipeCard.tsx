import { Link } from 'react-router-dom';
import { HouseholdAvatar } from '../atoms/HouseholdAvatar';
import { RECIPE_DIFFICULTY_LABELS, RECIPE_TAG_LABELS } from '../../types/recipe';
import type { Recipe } from '../../types/recipe';

interface Props {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: Props) {
  return (
    <Link to={`/rezepte/${recipe.id}`} className="recipe-card">
      <div className="recipe-card-photo">
        {recipe.photoUrl ? <img src={recipe.photoUrl} alt="" loading="lazy" /> : <span className="recipe-card-photo-placeholder">🍽️</span>}
      </div>
      <div className="recipe-card-body">
        <h3>{recipe.title}</h3>
        {recipe.description && <p>{recipe.description}</p>}
        <div className="recipe-card-meta">
          {recipe.prepMinutes !== null && <span>⏱ {recipe.prepMinutes} Min.</span>}
          {recipe.servings !== null && <span>🍽 {recipe.servings} Portionen</span>}
          <span>{RECIPE_DIFFICULTY_LABELS[recipe.difficulty]}</span>
        </div>
        {recipe.tags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.tags.map((tag) => (
              <span key={tag}>{RECIPE_TAG_LABELS[tag]}</span>
            ))}
          </div>
        )}
        <div className="recipe-card-footer">
          <span className="recipe-card-author">
            <HouseholdAvatar avatarKey={recipe.householdAvatarKey} fallback={recipe.householdName} size={28} />
            {recipe.householdName}
          </span>
          <span className="recipe-card-stats">
            <span data-active={recipe.reactedByMe}>{recipe.reactedByMe ? '♥' : '♡'} {recipe.reactionCount}</span>
            <span>💬 {recipe.commentCount}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
