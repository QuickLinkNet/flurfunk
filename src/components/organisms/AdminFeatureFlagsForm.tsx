import { Switch } from '../atoms/Switch';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { updateFeatureFlags } from '../../api/featureFlagsApi';
import { FEATURE_LABELS } from '../../types/featureFlags';
import type { FeatureKey } from '../../types/featureFlags';

export function AdminFeatureFlagsForm() {
  const { flags, refresh } = useFeatureFlags();

  async function handleToggle(key: FeatureKey, enabled: boolean) {
    await updateFeatureFlags({ [key]: enabled });
    refresh();
  }

  if (!flags) {
    return <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((key) => (
        <div
          key={key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 'var(--md-radius-control)',
            background: 'var(--md-color-surface)',
            border: '1px solid var(--md-color-border)'
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>{FEATURE_LABELS[key]}</span>
          <Switch checked={flags[key]} onChange={(enabled) => handleToggle(key, enabled)} />
        </div>
      ))}
    </div>
  );
}
