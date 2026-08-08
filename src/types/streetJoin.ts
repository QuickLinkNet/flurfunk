export interface StreetJoinHousehold {
  id: number;
  name: string;
  addressLine: string;
}

export interface StreetJoinPreview {
  streetName: string;
  households: StreetJoinHousehold[];
}

export type StreetJoinMode = 'create' | 'join';

export interface StreetJoinInput {
  mode: StreetJoinMode;
  displayName: string;
  email: string;
  password: string;
  name?: string;
  addressLine?: string;
  householdId?: number;
}
