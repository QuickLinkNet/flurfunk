import { Switch } from '../atoms/Switch';
import { CardRow } from '../molecules/CardRow';
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
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-space-2)' }}>
      {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((key) => (
        <CardRow key={key} action={<Switch checked={flags[key]} onChange={(enabled) => handleToggle(key, enabled)} />}>
          <span style={{ fontSize: 'var(--md-font-size-base)', fontWeight: 'var(--md-font-weight-medium)' }}>
            {FEATURE_LABELS[key]}
          </span>
        </CardRow>
      ))}
    </div>
  );
}
