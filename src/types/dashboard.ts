import type { CalendarEntry } from './calendarEntry';
import type { ChildLocation } from './child';
import type { FeedItemType } from './feedItem';
import type { Household } from './household';

export interface DashboardEvent {
  id: number;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  creatorHouseholdName: string;
}

export interface DashboardUpdate {
  id: number;
  householdName: string;
  type: FeedItemType;
  message: string | null;
  createdAt: string;
  badge: string;
}

export interface DashboardChild {
  id: number;
  name: string;
  currentLocation: ChildLocation;
  locationNote: string | null;
  updatedAt: string;
}

export interface DashboardVacation {
  id: number;
  name: string;
  until: string | null;
}

export interface DashboardNotice {
  title: string;
  message: string;
}

export interface DashboardBirthday {
  name: string;
  householdName: string | null;
}

export interface DashboardData {
  streetName: string;
  householdsStatus: Household[];
  todayEvents: DashboardEvent[];
  quickUpdates: DashboardUpdate[];
  childrenToday: DashboardChild[];
  upcomingDates: CalendarEntry[];
  wastePickups: CalendarEntry[];
  vacations: DashboardVacation[];
  notice: DashboardNotice;
  todaysBirthdays: DashboardBirthday[];
}
