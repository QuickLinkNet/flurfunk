import { useContext } from 'react';
import { FeatureFlagsContext } from '../context/FeatureFlagsContext';

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags muss innerhalb von <FeatureFlagsProvider> verwendet werden.');
  return ctx;
}
