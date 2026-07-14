import { Button } from '../atoms/Button';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  loading = false,
  onConfirm,
  onCancel
}: Props) {
  if (!open) return null;

  return (
    <div className="confirm-dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div>
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-description">{description}</p>
        </div>
        <div className="confirm-dialog-actions">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Speichert ...' : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
