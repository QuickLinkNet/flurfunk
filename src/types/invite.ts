export interface InvitePreview {
  firstName: string;
  lastName: string;
  householdName: string | null;
}

export interface HouseholdInvitePerson {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  usedAt: string | null;
}
