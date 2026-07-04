export type UserRole = 'admin' | 'member' | 'guest';

export interface User {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  householdId: number | null;
}
