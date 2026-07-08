import { useEffect, useState } from 'react';
import { Select } from '../atoms/Select';
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
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(Object.keys(FIELD_LABELS) as Field[]).map((field) => (
        <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>{FIELD_LABELS[field]}</span>
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
        </div>
      ))}
    </div>
  );
}
