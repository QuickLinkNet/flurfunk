export type ChildLocation =
  | 'mama' | 'papa' | 'both' | 'grandparents'
  | 'friends' | 'vacation' | 'school' | 'kindergarten' | 'other';

export interface Child {
  id: number;
  name: string;
  birthdate: string | null;
  currentLocation: ChildLocation;
  locationNote: string | null;
  updatedAt: string;
}

export const CHILD_LOCATION_LABELS: Record<ChildLocation, string> = {
  mama: 'bei Mama',
  papa: 'bei Papa',
  both: 'bei beiden Eltern',
  grandparents: 'bei Oma/Opa',
  friends: 'bei Freunden',
  vacation: 'im Urlaub',
  school: 'in der Schule',
  kindergarten: 'im Kindergarten',
  other: 'unterwegs'
};
