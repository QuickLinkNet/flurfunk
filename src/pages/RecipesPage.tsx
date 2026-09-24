import { useCallback, useEffect, useState } from 'react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { RecipeGrid } from '../components/organisms/RecipeGrid';
import { NewRecipeForm } from '../components/organisms/NewRecipeForm';
import { ActionDialog } from '../components/molecules/ActionDialog';
import { fetchRecipes } from '../api/recipeApi';
import { PAGE_HEADERS } from '../content/pageHeaders';
import { RECIPE_TAG_LABELS } from '../types/recipe';
import type { Recipe, RecipeTag } from '../types/recipe';

const TAG_OPTIONS = Object.entries(RECIPE_TAG_LABELS) as [RecipeTag, string][];

export function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTag, setActiveTag] = useState<RecipeTag | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const reload = useCallback(() => {
    fetchRecipes(activeTag ?? undefined).then(setRecipes).catch(() => setRecipes([]));
  }, [activeTag]);

  useEffect(() => reload(), [reload]);

  return (
    <DashboardTemplate pageTitle={PAGE_HEADERS.recipes.title} pageSubtitle={PAGE_HEADERS.recipes.subtitle}>
      <section>
        <div className="recipe-toolbar">
          <div className="recipe-filter-tabs" role="tablist" aria-label="Kategorien">
            <button type="button" role="tab" aria-selected={activeTag === null} data-active={activeTag === null} onClick={() => setActiveTag(null)}>
              Alle
            </button>
            {TAG_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={activeTag === value}
                data-active={activeTag === value}
                onClick={() => setActiveTag(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="recipe-create-button" onClick={() => setIsCreating(true)}>
            + Rezept
          </button>
        </div>

        <RecipeGrid recipes={recipes} />
      </section>

      <ActionDialog open={isCreating} title="Rezept teilen" onClose={() => setIsCreating(false)}>
        <NewRecipeForm
          onSaved={() => {
            setIsCreating(false);
            reload();
          }}
          onCancel={() => setIsCreating(false)}
        />
      </ActionDialog>
    </DashboardTemplate>
  );
}
