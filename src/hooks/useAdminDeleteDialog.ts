import { useState } from 'react';
import {
  deleteAdminCalendarEntry,
  deleteAdminEvent,
  deleteAdminFeedItem,
  deleteAdminNotice
} from '../api/adminApi';
import type { AdminCalendarEntry, AdminEvent, AdminFeedItem, AdminNotice } from '../types/admin';

type PendingDelete =
  | {
      type: 'feed';
      id: number;
      title: string;
      description: string;
    }
  | {
      type: 'event';
      id: number;
      title: string;
      description: string;
    }
  | {
      type: 'calendar';
      id: number;
      title: string;
      description: string;
    }
  | {
      type: 'notice';
      id: number;
      title: string;
      description: string;
    };

interface Options {
  onDeleted: () => void;
}

export function useAdminDeleteDialog({ onDeleted }: Options) {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function requestDeleteFeedItem(item: AdminFeedItem) {
    setPendingDelete({
      type: 'feed',
      id: item.id,
      title: 'Feed-Eintrag löschen?',
      description: `Der Eintrag von "${item.householdName}" wird aus dem Straßen-Feed entfernt.`
    });
  }

  function requestDeleteEvent(event: AdminEvent) {
    setPendingDelete({
      type: 'event',
      id: event.id,
      title: 'Event löschen?',
      description: `Das Event "${event.title}" wird inklusive Zusagen entfernt.`
    });
  }

  function requestDeleteCalendarEntry(entry: AdminCalendarEntry) {
    setPendingDelete({
      type: 'calendar',
      id: entry.id,
      title: 'Kalendereintrag löschen?',
      description: `Der Kalendereintrag "${entry.title}" wird entfernt.`
    });
  }

  function requestDeleteNotice(notice: AdminNotice) {
    setPendingDelete({
      type: 'notice',
      id: notice.id,
      title: 'Hinweis löschen?',
      description: `Der Dashboard-Hinweis "${notice.title}" wird entfernt.`
    });
  }

  async function confirmPendingDelete() {
    if (!pendingDelete) return;

    setDeleteLoading(true);
    try {
      if (pendingDelete.type === 'feed') {
        await deleteAdminFeedItem(pendingDelete.id);
      } else if (pendingDelete.type === 'event') {
        await deleteAdminEvent(pendingDelete.id);
      } else if (pendingDelete.type === 'calendar') {
        await deleteAdminCalendarEntry(pendingDelete.id);
      } else {
        await deleteAdminNotice(pendingDelete.id);
      }
      setPendingDelete(null);
      onDeleted();
    } finally {
      setDeleteLoading(false);
    }
  }

  return {
    deleteDialogProps: {
      open: pendingDelete !== null,
      title: pendingDelete?.title ?? '',
      description: pendingDelete?.description ?? '',
      confirmLabel: 'Löschen',
      loading: deleteLoading,
      onCancel: () => setPendingDelete(null),
      onConfirm: confirmPendingDelete
    },
    requestDeleteCalendarEntry,
    requestDeleteEvent,
    requestDeleteFeedItem,
    requestDeleteNotice
  };
}
