import { useEffect, useState } from 'react';
import { Select } from '../atoms/Select';
import { CardRow } from '../molecules/CardRow';
import { fetchMyVisibility, updateMyVisibility } from '../../api/visibilityApi';
import type { Visibility } from '../../utils/visibility';

type Field = 'status' | 'vacation' | 'children_location' | 'events';
type VisibilityMap = Record<Field, Visibility>;

const FIELD_LABELS: Record<Field, string> = {
  status: 'Haushaltsstatus',
  vacation: 'Urlaub',
  children_location: 'Aufenthaltsort der Kinder',
  events: 'Eigene Events'
};

const OPTIONS: Array<{ value: Visibility; label: string }> = [
  { value: 'public', label: 'Öffentlich' },
  { value: 'neighbors', label: 'Nur Nachbarn' },
  { value: 'private', label: 'Privat' }
];

export function VisibilitySettingsForm() {
  const [settings, setSettings] = useState<VisibilityMap | null>(null);

  useEffect(() => {
    fetchMyVisibility().then(setSettings).catch(() => setSettings(null));
  }, []);

  async function handleChange(field: Field, visibility: Visibility) {
    setSettings((prev) => (prev ? { ...prev, [field]: visibility } : prev));
    await updateMyVisibility({ [field]: visibility });
  }

  if (!settings) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {(Object.keys(FIELD_LABELS) as Field[]).map((field) => (
        <CardRow
          key={field}
          action={
            <Select
              value={settings[field]}
              onChange={(e) => handleChange(field, e.target.value as Visibility)}
              style={{ width: 160 }}
            >
              {OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          }
        >
          <span style={{ fontSize: 'var(--md-font-size-base)' }}>{FIELD_LABELS[field]}</span>
        </CardRow>
      ))}
    </div>
  );
}
