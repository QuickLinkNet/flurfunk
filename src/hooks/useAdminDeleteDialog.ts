import { useState } from 'react';
import {
  deleteAdminCalendarEntry,
  deleteAdminEvent,
  deleteAdminFeedItem,
  deleteAdminFeedback,
  deleteAdminNotice,
  deleteAdminUser
} from '../api/adminApi';
import type { AdminCalendarEntry, AdminEvent, AdminFeedItem, AdminFeedbackReport, AdminNotice, AdminUser } from '../types/admin';

type PendingDelete =
  | { type: 'feed'; id: number; title: string; description: string }
  | { type: 'event'; id: number; title: string; description: string }
  | { type: 'calendar'; id: number; title: string; description: string }
  | { type: 'notice'; id: number; title: string; description: string }
  | { type: 'user'; id: number; title: string; description: string }
  | { type: 'feedback'; id: number; title: string; description: string };

interface Options {
  onDeleted: () => void;
}

export function useAdminDeleteDialog({ onDeleted }: Options) {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openDeleteDialog(next: PendingDelete) {
    setDeleteError(null);
    setPendingDelete(next);
  }

  function requestDeleteFeedItem(item: AdminFeedItem) {
    openDeleteDialog({
      type: 'feed',
      id: item.id,
      title: 'Feed-Eintrag löschen?',
      description: `Der Eintrag von "${item.householdName}" wird aus dem Straßen-Feed entfernt.`
    });
  }

  function requestDeleteEvent(event: AdminEvent) {
    openDeleteDialog({
      type: 'event',
      id: event.id,
      title: 'Event löschen?',
      description: `Das Event "${event.title}" wird inklusive Zusagen entfernt.`
    });
  }

  function requestDeleteCalendarEntry(entry: AdminCalendarEntry) {
    openDeleteDialog({
      type: 'calendar',
      id: entry.id,
      title: 'Kalendereintrag löschen?',
      description: `Der Kalendereintrag "${entry.title}" wird entfernt.`
    });
  }

  function requestDeleteNotice(notice: AdminNotice) {
    openDeleteDialog({
      type: 'notice',
      id: notice.id,
      title: 'Hinweis löschen?',
      description: `Der Dashboard-Hinweis "${notice.title}" wird entfernt.`
    });
  }

  function requestDeleteFeedback(report: AdminFeedbackReport) {
    openDeleteDialog({
      type: 'feedback',
      id: report.id,
      title: 'Feedback löschen?',
      description: `Die Meldung von "${report.reporterName}" wird entfernt.`
    });
  }

  function requestDeleteUser(user: AdminUser) {
    openDeleteDialog({
      type: 'user',
      id: user.id,
      title: 'Nutzer löschen?',
      description: `Der Nutzer "${user.displayName}" (${user.email}) wird dauerhaft entfernt. Kommentare, Reaktionen und Push-Abos werden serverseitig bereinigt.`
    });
  }

  async function confirmPendingDelete() {
    if (!pendingDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      if (pendingDelete.type === 'feed') {
        await deleteAdminFeedItem(pendingDelete.id);
      } else if (pendingDelete.type === 'event') {
        await deleteAdminEvent(pendingDelete.id);
      } else if (pendingDelete.type === 'calendar') {
        await deleteAdminCalendarEntry(pendingDelete.id);
      } else if (pendingDelete.type === 'notice') {
        await deleteAdminNotice(pendingDelete.id);
      } else if (pendingDelete.type === 'feedback') {
        await deleteAdminFeedback(pendingDelete.id);
      } else {
        await deleteAdminUser(pendingDelete.id);
      }
      setPendingDelete(null);
      onDeleted();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Löschen fehlgeschlagen.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const description = [
    pendingDelete?.description ?? '',
    deleteError ? `Fehler: ${deleteError}` : ''
  ].filter(Boolean).join('\n\n');

  return {
    deleteDialogProps: {
      open: pendingDelete !== null,
      title: pendingDelete?.title ?? '',
      description,
      confirmLabel: 'Löschen',
      loading: deleteLoading,
      onCancel: () => {
        setDeleteError(null);
        setPendingDelete(null);
      },
      onConfirm: confirmPendingDelete
    },
    requestDeleteCalendarEntry,
    requestDeleteEvent,
    requestDeleteFeedItem,
    requestDeleteFeedback,
    requestDeleteNotice,
    requestDeleteUser
  };
}
