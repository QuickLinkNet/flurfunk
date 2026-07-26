import type { ChildLocation } from './child';

export interface NeighborStatus {
  emoji: string;
  label: string;
  note: string | null;
  updatedAt: string | null;
}

export interface NeighborVacation {
  label: string;
  note: string | null;
}

export interface NeighborChild {
  id: number;
  name: string;
  currentLocation: ChildLocation;
  locationNote: string | null;
  updatedAt: string;
}

export interface NeighborEvent {
  id: number;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
}

export interface NeighborHousehold {
  id: number;
  name: string;
  addressLine: string;
  avatarKey: string;
  isOwnHousehold: boolean;
  statusVisible: boolean;
  vacationVisible: boolean;
  childrenVisible: boolean;
  eventsVisible: boolean;
  status: NeighborStatus | null;
  vacation: NeighborVacation | null;
  children: NeighborChild[];
  events: NeighborEvent[];
}
