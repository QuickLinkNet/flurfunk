import { createContext, useEffect, useState, type ReactNode } from 'react';
import { fetchFeatureFlags } from '../api/featureFlagsApi';
import type { FeatureFlags, FeatureKey } from '../types/featureFlags';

interface FeatureFlagsContextValue {
  flags: FeatureFlags | null;
  isEnabled: (key: FeatureKey) => boolean;
  refresh: () => void;
}

export const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);

  function refresh() {
    fetchFeatureFlags().then(setFlags).catch(() => setFlags(null));
  }

  useEffect(refresh, []);

  // Solange die Flags noch nicht geladen sind, gilt alles als aktiv -
  // verhindert ein kurzes Aufblitzen/Verschwinden der Navigation.
  function isEnabled(key: FeatureKey): boolean {
    return flags ? flags[key] : true;
  }

  return <FeatureFlagsContext.Provider value={{ flags, isEnabled, refresh }}>{children}</FeatureFlagsContext.Provider>;
}
