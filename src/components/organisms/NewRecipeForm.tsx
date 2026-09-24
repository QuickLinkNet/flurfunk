import { useState, type FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Textarea } from '../atoms/Textarea';
import { PhotoPickerField } from '../molecules/PhotoPickerField';
import { createRecipe, deleteRecipePhoto, updateRecipe, uploadRecipePhoto } from '../../api/recipeApi';
import { RECIPE_DIFFICULTY_LABELS, RECIPE_TAG_LABELS } from '../../types/recipe';
import type { Recipe, RecipeDifficulty, RecipeTag } from '../../types/recipe';

const TAG_OPTIONS = Object.entries(RECIPE_TAG_LABELS) as [RecipeTag, string][];
const DIFFICULTY_OPTIONS = Object.entries(RECIPE_DIFFICULTY_LABELS) as [RecipeDifficulty, string][];

interface Props {
  recipe?: Recipe;
  onSaved: () => void;
  onCancel?: () => void;
}

export function NewRecipeForm({ recipe, onSaved, onCancel }: Props) {
  const isEditMode = Boolean(recipe);
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [ingredients, setIngredients] = useState(recipe?.ingredients ?? '');
  const [steps, setSteps] = useState(recipe?.steps ?? '');
  const [prepMinutes, setPrepMinutes] = useState(recipe?.prepMinutes?.toString() ?? '');
  const [servings, setServings] = useState(recipe?.servings?.toString() ?? '');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>(recipe?.difficulty ?? 'easy');
  const [tags, setTags] = useState<RecipeTag[]>(recipe?.tags ?? []);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoTouched, setPhotoTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function toggleTag(tag: RecipeTag) {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !ingredients.trim() || !steps.trim()) {
      setError('Titel, Zutaten und Zubereitung sind Pflicht.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const input = {
        title: title.trim(),
        description: description.trim() || undefined,
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        prepMinutes: prepMinutes ? Number(prepMinutes) : null,
        servings: servings ? Number(servings) : null,
        difficulty,
        tags
      };

      const recipeId = isEditMode ? recipe!.id : (await createRecipe(input)).id;
      if (isEditMode) {
        await updateRecipe(recipeId, input);
      }
      if (photoTouched) {
        if (photoFile) {
          await uploadRecipePhoto(recipeId, photoFile);
        } else if (recipe?.photoUrl) {
          await deleteRecipePhoto(recipeId);
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezept konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="recipe-form">
      <Input placeholder="Titel, z. B. Cremige One-Pot-Pasta" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      <Input placeholder="Kurzbeschreibung (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />

      <div className="recipe-form-grid">
        <label className="recipe-form-field">
          <span>Zubereitungszeit (Min.)</span>
          <Input type="number" min={0} value={prepMinutes} onChange={(e) => setPrepMinutes(e.target.value)} />
        </label>
        <label className="recipe-form-field">
          <span>Portionen</span>
          <Input type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} />
        </label>
        <label className="recipe-form-field">
          <span>Schwierigkeit</span>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}>
            {DIFFICULTY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </label>
      </div>

      <div className="recipe-form-field">
        <span>Kategorien</span>
        <div className="recipe-tag-picker" role="group" aria-label="Kategorien wählen">
          {TAG_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              data-active={tags.includes(value)}
              onClick={() => toggleTag(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="recipe-form-field">
        <span>Zutaten (eine Zeile pro Zutat)</span>
        <Textarea
          placeholder={'500 g Nudeln\n2 Knoblauchzehen\n...'}
          value={ingredients}
          rows={5}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </label>

      <label className="recipe-form-field">
        <span>Zubereitung</span>
        <Textarea
          placeholder="Schritt für Schritt, wie's gemacht wird ..."
          value={steps}
          rows={6}
          onChange={(e) => setSteps(e.target.value)}
        />
      </label>

      <PhotoPickerField
        initialUrl={recipe?.photoUrl ?? null}
        onFileSelected={(file) => {
          setPhotoFile(file);
          setPhotoTouched(true);
        }}
      />

      <div className="md-card-actions">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Speichert...' : isEditMode ? 'Speichern' : 'Rezept teilen'}
        </Button>
      </div>
      {error && <p className="recipe-form-message">{error}</p>}
    </form>
  );
}
