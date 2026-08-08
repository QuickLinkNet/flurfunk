import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminCalendar,
  fetchAdminEvents,
  fetchAdminFeed,
  fetchAdminFeedback,
  fetchAdminHouseholds,
  fetchAdminNotices,
  fetchAdminUsers
} from '../api/adminApi';
import type {
  AdminCalendarEntry,
  AdminEvent,
  AdminFeedItem,
  AdminFeedbackReport,
  AdminHousehold,
  AdminNotice,
  AdminUser
} from '../types/admin';

export function useAdminData() {
  const [households, setHouseholds] = useState<AdminHousehold[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [feed, setFeed] = useState<AdminFeedItem[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [calendar, setCalendar] = useState<AdminCalendarEntry[]>([]);
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [feedback, setFeedback] = useState<AdminFeedbackReport[]>([]);

  const reload = useCallback(() => {
    fetchAdminHouseholds().then(setHouseholds).catch(() => setHouseholds([]));
    fetchAdminUsers().then(setUsers).catch(() => setUsers([]));
    fetchAdminFeed().then(setFeed).catch(() => setFeed([]));
    fetchAdminEvents().then(setEvents).catch(() => setEvents([]));
    fetchAdminCalendar().then(setCalendar).catch(() => setCalendar([]));
    fetchAdminNotices().then(setNotices).catch(() => setNotices([]));
    fetchAdminFeedback().then(setFeedback).catch(() => setFeedback([]));
  }, []);

  useEffect(() => reload(), [reload]);

  return {
    calendar,
    events,
    feed,
    feedback,
    households,
    notices,
    reload,
    users
  };
}
