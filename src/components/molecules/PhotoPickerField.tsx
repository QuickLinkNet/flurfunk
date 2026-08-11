import { useRef, useState, type ChangeEvent } from 'react';

interface Props {
  onFileSelected: (file: File | null) => void;
  label?: string;
}

const MAX_BYTES = 6 * 1024 * 1024;

export function PhotoPickerField({ onFileSelected, label = 'Foto hinzufügen (optional)' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Bitte eine Bilddatei auswählen.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Bild ist zu groß (max. 6 MB).');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onFileSelected(null);
  }

  return (
    <div className="photo-picker-field">
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
      {previewUrl ? (
        <div className="photo-picker-preview">
          <img src={previewUrl} alt="" />
          <button type="button" onClick={clear}>
            Foto entfernen
          </button>
        </div>
      ) : (
        <button type="button" className="photo-picker-trigger" onClick={() => inputRef.current?.click()}>
          📷 {label}
        </button>
      )}
      {error && <p className="photo-picker-error">{error}</p>}
    </div>
  );
}
