import { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import deLocale from '@fullcalendar/core/locales/de';
import { ActionDialog } from '../molecules/ActionDialog';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { CalendarEntryDetail } from '../molecules/CalendarEntryDetail';
import { NewCalendarEntryForm } from './NewCalendarEntryForm';
import { deleteCalendarEntry } from '../../api/calendarApi';
import { CALENDAR_TYPE_META, CALENDAR_TYPE_OPTIONS } from '../../utils/calendarTypeMeta';
import type { CalendarEntry } from '../../types/calendarEntry';
import type { CSSProperties } from 'react';

interface Props {
  entries: CalendarEntry[];
  onChanged: () => void;
}

type Filter = CalendarEntry['type'];

export function CalendarBoard({ entries, onChanged }: Props) {
  const [filters, setFilters] = useState<Set<Filter>>(() => new Set(CALENDAR_TYPE_OPTIONS.map(([type]) => type)));
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<CalendarEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const selectedEntry = useMemo(() => entries.find((entry) => entry.id === selectedEntryId) ?? null, [entries, selectedEntryId]);
  const visibleEntryCount = entries.filter((entry) => filters.has(entry.type)).length;
  const allFiltersActive = filters.size === CALENDAR_TYPE_OPTIONS.length;
  const hasActiveFilters = filters.size > 0;
  const initialView = typeof window !== 'undefined' && window.innerWidth < 720 ? 'listWeek' : 'dayGridMonth';

  const events = useMemo(
    () =>
      entries
        .filter((entry) => filters.has(entry.type))
        .map((entry) => {
          const meta = CALENDAR_TYPE_META[entry.type];
          return {
            id: String(entry.id),
            title: entry.title,
            start: entry.startsAt,
            end: entry.endsAt ?? undefined,
            allDay: entry.allDay,
            backgroundColor: meta.color,
            borderColor: meta.color,
            extendedProps: { type: entry.type, label: meta.label }
          };
        }),
    [entries, filters]
  );

  function toggleFilter(type: Filter) {
    setFilters((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function setAllFilters() {
    setFilters(new Set(CALENDAR_TYPE_OPTIONS.map(([type]) => type)));
  }

  function clearFilters() {
    setFilters(new Set());
  }

  async function confirmDelete() {
    if (!deletingEntry) return;
    setIsDeleting(true);
    try {
      await deleteCalendarEntry(deletingEntry.id);
      setDeletingEntry(null);
      setSelectedEntryId(null);
      onChanged();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="calendar-board">
      <div className="calendar-toolbar">
        <div className="calendar-filter-panel">
          <div className="calendar-filter-summary">
            <strong>{visibleEntryCount}</strong>
            <span>{visibleEntryCount === 1 ? 'Termin sichtbar' : 'Termine sichtbar'}</span>
            <button type="button" onClick={allFiltersActive ? clearFilters : setAllFilters}>
              {allFiltersActive ? 'Alle aus' : 'Alle an'}
            </button>
          </div>
          <div className="calendar-filterbar">
            <button type="button" className="calendar-filterchip" data-active={allFiltersActive} onClick={setAllFilters}>
              Alle
            </button>
            {CALENDAR_TYPE_OPTIONS.map(([type, meta]) => (
              <button
                key={type}
                type="button"
                className="calendar-filterchip"
                data-active={filters.has(type)}
                onClick={() => toggleFilter(type)}
                style={{ '--calendar-color': meta.color } as CSSProperties}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="calendar-create-button"
          onClick={() => {
            setSelectedEntryId(null);
            setEditingEntry(null);
            setIsCreating(true);
          }}
        >
          + Termin
        </button>
      </div>
      {!hasActiveFilters && <p className="calendar-empty-filter">Alle Kategorien sind ausgeblendet.</p>}
      {selectedEntry && !editingEntry && (
        <CalendarEntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntryId(null)}
          onEdit={() => setEditingEntry(selectedEntry)}
          onDelete={() => setDeletingEntry(selectedEntry)}
        />
      )}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        locale={deLocale}
        initialView={initialView}
        views={{
          dayGridMonth: { dayMaxEvents: 3 },
          timeGridWeek: { dayHeaderFormat: { weekday: 'short', day: '2-digit', month: '2-digit' } },
          listWeek: { noEventsText: 'Keine Termine in dieser Woche.' }
        }}
        windowResize={(arg) => {
          const nextView = window.innerWidth < 720 ? 'listWeek' : 'dayGridMonth';
          if (arg.view.type !== nextView) arg.view.calendar.changeView(nextView);
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        }}
        buttonText={{
          today: 'Heute',
          month: 'Monat',
          week: 'Woche',
          list: 'Liste'
        }}
        events={events}
        height="auto"
        firstDay={1}
        nowIndicator
        dayMaxEvents={3}
        eventDisplay="block"
        selectable
        dateClick={(info) => {
          setSelectedDate(info.dateStr);
          setSelectedEntryId(null);
          setIsCreating(true);
        }}
        eventClick={(info) => {
          setSelectedEntryId(Number(info.event.id));
          setIsCreating(false);
          setEditingEntry(null);
        }}
      />
      <ActionDialog
        open={isCreating}
        title="Termin erstellen"
        onClose={() => setIsCreating(false)}
      >
        <NewCalendarEntryForm
          initialDate={selectedDate}
          onCreated={() => {
            setIsCreating(false);
            onChanged();
          }}
          onCancel={() => setIsCreating(false)}
        />
      </ActionDialog>
      <ActionDialog
        open={Boolean(editingEntry)}
        title="Termin bearbeiten"
        onClose={() => setEditingEntry(null)}
      >
        {editingEntry && (
          <NewCalendarEntryForm
            entry={editingEntry}
            onCreated={() => {
              setEditingEntry(null);
              setSelectedEntryId(null);
              onChanged();
            }}
            onCancel={() => setEditingEntry(null)}
          />
        )}
      </ActionDialog>
      <ConfirmDialog
        open={Boolean(deletingEntry)}
        title="Termin löschen?"
        description={deletingEntry ? `Soll "${deletingEntry.title}" wirklich gelöscht werden?` : ''}
        confirmLabel="Löschen"
        loading={isDeleting}
        onCancel={() => setDeletingEntry(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
