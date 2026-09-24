import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { ActionDialog } from '../components/molecules/ActionDialog';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { HouseholdAvatar } from '../components/atoms/HouseholdAvatar';
import { Button } from '../components/atoms/Button';
import { Textarea } from '../components/atoms/Textarea';
import { NewRecipeForm } from '../components/organisms/NewRecipeForm';
import { addRecipeComment, deleteRecipe, fetchRecipe, toggleRecipeReaction } from '../api/recipeApi';
import { RECIPE_DIFFICULTY_LABELS, RECIPE_TAG_LABELS } from '../types/recipe';
import type { Recipe } from '../types/recipe';

function formatDate(value: string): string {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Datum unbekannt';
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function lines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!id) return;
    fetchRecipe(Number(id)).then(setRecipe).catch(() => setRecipe(null));
  }, [id]);

  useEffect(() => reload(), [reload]);

  async function handleReaction() {
    if (!recipe) return;
    setIsReacting(true);
    try {
      const result = await toggleRecipeReaction(recipe.id);
      setRecipe({ ...recipe, reactedByMe: result.reactedByMe, reactionCount: result.reactionCount });
    } finally {
      setIsReacting(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();
    if (!recipe || !comment.trim()) return;
    setIsCommenting(true);
    setMessage(null);
    try {
      const comments = await addRecipeComment(recipe.id, comment.trim());
      setRecipe({ ...recipe, comments, commentCount: comments.length });
      setComment('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kommentar konnte nicht gespeichert werden.');
    } finally {
      setIsCommenting(false);
    }
  }

  async function handleDelete() {
    if (!recipe) return;
    setIsDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      navigate('/rezepte', { replace: true });
    } finally {
      setIsDeleting(false);
    }
  }

  if (!recipe) {
    return (
      <DashboardTemplate pageTitle="Rezept" pageSubtitle="Wird geladen ...">
        <p />
      </DashboardTemplate>
    );
  }

  return (
    <DashboardTemplate pageTitle={recipe.title} pageSubtitle={recipe.description ?? undefined}>
      <section className="recipe-detail">
        {recipe.photoUrl && <img className="recipe-detail-photo" src={recipe.photoUrl} alt="" />}

        <div className="recipe-detail-meta">
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

        <div className="recipe-detail-author">
          <HouseholdAvatar avatarKey={recipe.householdAvatarKey} fallback={recipe.householdName} size={40} />
          <span>
            <strong>{recipe.householdName}</strong> · {formatDate(recipe.createdAt)}
          </span>
        </div>

        <div className="recipe-detail-columns">
          <div>
            <h3>Zutaten</h3>
            <ul className="recipe-detail-ingredients">
              {lines(recipe.ingredients).map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Zubereitung</h3>
            <ol className="recipe-detail-steps">
              {lines(recipe.steps).map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="feed-actions">
          <button type="button" data-active={recipe.reactedByMe} disabled={isReacting} onClick={handleReaction}>
            {recipe.reactedByMe ? '♥' : '♡'} {recipe.reactionCount}
          </button>
          {recipe.canManage && (
            <>
              <button type="button" onClick={() => setIsEditing(true)}>✏️ Bearbeiten</button>
              <button type="button" onClick={() => setConfirmDeleteOpen(true)}>🗑 Löschen</button>
            </>
          )}
        </div>

        <div className="feed-replies">
          <h3>Kommentare</h3>
          {recipe.comments && recipe.comments.length > 0 ? (
            <ul className="feed-comments">
              {recipe.comments.map((entry) => (
                <li key={entry.id} className="feed-comment">
                  <div>
                    <strong>{entry.householdName ?? entry.authorName}</strong>
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>
                  <p>{entry.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="feed-comments-empty">Noch keine Kommentare. Schreib den ersten.</p>
          )}

          <form className="feed-comment-form" onSubmit={handleCommentSubmit}>
            <Textarea
              placeholder="Kommentar schreiben..."
              value={comment}
              rows={2}
              maxLength={500}
              onChange={(event) => setComment(event.target.value)}
              style={{ minHeight: 84 }}
            />
            <Button type="submit" variant="secondary" disabled={isCommenting}>
              {isCommenting ? 'Sendet...' : 'Antworten'}
            </Button>
          </form>
          {message && <p className="feed-card-message">{message}</p>}
        </div>
      </section>

      <ActionDialog open={isEditing} title="Rezept bearbeiten" onClose={() => setIsEditing(false)}>
        <NewRecipeForm
          recipe={recipe}
          onSaved={() => {
            setIsEditing(false);
            reload();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </ActionDialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Rezept löschen?"
        description={`Soll "${recipe.title}" wirklich gelöscht werden?`}
        confirmLabel="Löschen"
        loading={isDeleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </DashboardTemplate>
  );
}
