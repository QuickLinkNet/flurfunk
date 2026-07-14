import { forwardRef, useEffect, useState } from 'react';
import { HouseholdDetailsForm, type HouseholdDetailsFormHandle } from '../molecules/HouseholdDetailsForm';
import { fetchMyHousehold, updateMyHousehold } from '../../api/householdsApi';
import type { Household } from '../../types/household';

interface Props {
  showActions?: boolean;
}

export const MyHouseholdDetailsForm = forwardRef<HouseholdDetailsFormHandle, Props>(function MyHouseholdDetailsForm(
  { showActions = true },
  ref
) {
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    fetchMyHousehold().then(setHousehold).catch(() => setHousehold(null));
  }, []);

  if (!household) {
    return (
      <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt ...</p>
    );
  }

  return (
    <HouseholdDetailsForm
      ref={ref}
      initialName={household.name}
      initialAddressLine={household.addressLine}
      initialAvatarKey={household.avatarKey}
      showActions={showActions}
      onSave={async (name, addressLine, avatarKey) => {
        setHousehold(await updateMyHousehold({ name, addressLine, avatarKey }));
      }}
    />
  );
});
