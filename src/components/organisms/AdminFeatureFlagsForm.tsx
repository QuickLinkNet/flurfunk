import { useState } from 'react';
import { Switch } from '../atoms/Switch';
import { CardRow } from '../molecules/CardRow';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { updateFeatureFlags } from '../../api/featureFlagsApi';
import { FEATURE_LABELS } from '../../types/featureFlags';
import type { FeatureKey } from '../../types/featureFlags';

interface PendingChange {
  key: FeatureKey;
  enabled: boolean;
}

export function AdminFeatureFlagsForm() {
  const { flags, refresh } = useFeatureFlags();
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [saving, setSaving] = useState(false);

  async function confirmToggle() {
    if (!pendingChange) return;
    setSaving(true);
    try {
      await updateFeatureFlags({ [pendingChange.key]: pendingChange.enabled });
      await refresh();
      setPendingChange(null);
    } finally {
      setSaving(false);
    }
  }

  if (!flags) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
        {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((key) => (
          <CardRow
            key={key}
            action={
              <Switch
                checked={flags[key]}
                disabled={saving}
                onChange={(enabled) => setPendingChange({ key, enabled })}
              />
            }
          >
            <span style={{ fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
              {FEATURE_LABELS[key]}
            </span>
          </CardRow>
        ))}
      </div>
      <ConfirmDialog
        open={pendingChange !== null}
        title="Feature wirklich ändern?"
        description={
          pendingChange
            ? `${FEATURE_LABELS[pendingChange.key]} wird für die ganze Straße ${pendingChange.enabled ? 'aktiviert' : 'deaktiviert'}.`
            : ''
        }
        confirmLabel={pendingChange?.enabled ? 'Aktivieren' : 'Deaktivieren'}
        loading={saving}
        onCancel={() => setPendingChange(null)}
        onConfirm={confirmToggle}
      />
    </>
  );
}
