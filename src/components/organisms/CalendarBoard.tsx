import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Set<Filter>>(() => new Set(CALENDAR_TYPE_OPTIONS.map(([type]) => type)));
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<CalendarEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const visibleEntryCount = entries.filter((entry) => filters.has(entry.type)).length;
  const seriesCount = entries.filter((entry) => filters.has(entry.type) && entry.recurrenceRule !== 'none').length;
  const allFiltersActive = filters.size === CALENDAR_TYPE_OPTIONS.length;
  const hasActiveFilters = filters.size > 0;
  // Einheitlich Monatsansicht als Start, auch mobil - die Listenansicht
  // zeigt beim ersten Öffnen sonst oft "Keine Termine diese Woche" und
  // wirkt wie ein leerer Kalender, obwohl der Monat Einträge hat. Monat
  // ist mobil schon auf Overflow/Touch geprüft, funktioniert sauber.
  const initialView = 'dayGridMonth';

  const events = useMemo(
    () =>
      entries
        .filter((entry) => filters.has(entry.type))
        .map((entry) => {
          const meta = CALENDAR_TYPE_META[entry.type];
          return {
            id: `${entry.source ?? 'calendar'}-${entry.id}-${entry.startsAt}`,
            title: entry.recurrenceRule !== 'none' ? `↻ ${entry.title}` : entry.title,
            start: entry.startsAt,
            end: entry.endsAt ?? undefined,
            allDay: entry.allDay,
            backgroundColor: meta.color,
            borderColor: meta.color,
            extendedProps: { type: entry.type, label: meta.label, entry }
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
      await deleteCalendarEntry(Number(deletingEntry.id));
      setDeletingEntry(null);
      setSelectedEntry(null);
      onChanged();
    } finally {
      setIsDeleting(false);
    }
  }

  function isSeries(entry: CalendarEntry): boolean {
    return entry.recurrenceRule !== 'none';
  }

  return (
    <div className="calendar-board">
      <div className="calendar-toolbar">
        <div className="calendar-filter-panel">
          <div className="calendar-filter-summary">
            <span><strong>{visibleEntryCount}</strong> sichtbar</span>
            <span><strong>{seriesCount}</strong> Serien</span>
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
            setSelectedEntry(null);
            setEditingEntry(null);
            setIsCreating(true);
          }}
        >
          + Termin
        </button>
      </div>

      {!hasActiveFilters && <p className="calendar-empty-filter">Alle Kategorien sind ausgeblendet.</p>}
      {hasActiveFilters && visibleEntryCount === 0 && (
        <p className="calendar-empty-filter">Keine Termine in den aktiven Kategorien. Erstelle einen Termin oder aktiviere weitere Filter.</p>
      )}

      <ActionDialog open={Boolean(selectedEntry && !editingEntry)} title="Termindetails" onClose={() => setSelectedEntry(null)}>
        {selectedEntry && (
          <CalendarEntryDetail
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onEdit={() => setEditingEntry(selectedEntry)}
            onDelete={() => {
              setDeletingEntry(selectedEntry);
              setSelectedEntry(null);
            }}
          />
        )}
      </ActionDialog>

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
          setSelectedEntry(null);
          setIsCreating(true);
        }}
        eventClick={(info) => {
          const entry = info.event.extendedProps.entry as CalendarEntry | undefined;
          if (entry?.source === 'event' && entry.eventId) {
            navigate(`/events/${entry.eventId}`);
            return;
          }
          setSelectedEntry(entry ?? null);
          setIsCreating(false);
          setEditingEntry(null);
        }}
      />

      <ActionDialog open={isCreating} title="Termin erstellen" onClose={() => setIsCreating(false)}>
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
        title={editingEntry && isSeries(editingEntry) ? 'Serie bearbeiten' : 'Termin bearbeiten'}
        onClose={() => setEditingEntry(null)}
      >
        {editingEntry && (
          <NewCalendarEntryForm
            entry={editingEntry}
            onCreated={() => {
              setEditingEntry(null);
              setSelectedEntry(null);
              onChanged();
            }}
            onCancel={() => setEditingEntry(null)}
          />
        )}
      </ActionDialog>

      <ConfirmDialog
        open={Boolean(deletingEntry)}
        title={deletingEntry && isSeries(deletingEntry) ? 'Serie löschen?' : 'Termin löschen?'}
        description={deletingEntry ? `Soll "${deletingEntry.title}" wirklich ${isSeries(deletingEntry) ? 'als komplette Serie' : 'gelöscht'} werden?` : ''}
        confirmLabel={deletingEntry && isSeries(deletingEntry) ? 'Serie löschen' : 'Löschen'}
        loading={isDeleting}
        onCancel={() => setDeletingEntry(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
