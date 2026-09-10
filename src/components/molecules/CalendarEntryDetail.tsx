import { CALENDAR_TYPE_META } from '../../utils/calendarTypeMeta';
import { recurrenceSummary } from '../../utils/recurrenceLabels';
import { Button } from '../atoms/Button';
import { HouseholdAvatar } from '../atoms/HouseholdAvatar';
import type { CalendarEntry } from '../../types/calendarEntry';

interface Props {
  entry: CalendarEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDateTime(value: string): string {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Datum unbekannt';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function visibilityLabel(value: CalendarEntry['visibility']): string {
  if (value === 'public') return 'Sichtbar: öffentlich (auch für Gäste)';
  if (value === 'private') return 'Sichtbar: nur eigener Haushalt';
  return 'Sichtbar: ganze Nachbarschaft';
}

function dateSummary(entry: CalendarEntry): string {
  if (entry.source === 'birthday') {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date(entry.startsAt.replace(' ', 'T')));
  }
  if (entry.allDay) {
    return entry.endsAt ? `Ganztägig · ${entry.startsAt.slice(0, 10)} bis ${entry.endsAt.slice(0, 10)}` : `Ganztägig · ${entry.startsAt.slice(0, 10)}`;
  }
  return `${formatDateTime(entry.startsAt)}${entry.endsAt ? ` bis ${formatDateTime(entry.endsAt)}` : ''}`;
}

export function CalendarEntryDetail({ entry, onEdit, onDelete }: Props) {
  const meta = CALENDAR_TYPE_META[entry.type];
  const isSeries = entry.recurrenceRule !== 'none';

  return (
    <section className="calendar-detail">
      <div className="calendar-detail-header">
        <span className="calendar-detail-badge" style={{ background: `${meta.color}26`, color: meta.color }} aria-hidden="true">
          {meta.emoji}
        </span>
        <div>
          <p style={{ color: meta.color }}>{meta.label}</p>
          <h2>{entry.title}</h2>
        </div>
      </div>

      {entry.creatorHouseholdName && (
        <div className="calendar-detail-creator">
          <HouseholdAvatar avatarKey={entry.creatorHouseholdAvatarKey} fallback={entry.creatorHouseholdName} size={32} />
          <span>
            {entry.source === 'birthday' ? 'Haushalt' : 'Eingetragen von'} <strong>{entry.creatorHouseholdName}</strong>
          </span>
        </div>
      )}

      <div className="calendar-detail-meta">
        <span>{dateSummary(entry)}</span>
        <span>{visibilityLabel(entry.visibility)}</span>
        {isSeries && <span>{recurrenceSummary(entry.recurrenceRule, entry.recurrenceUntil)}</span>}
      </div>

      {entry.source === 'event' && (
        <p className="calendar-detail-note">Dieser Termin kommt aus dem Eventbereich und wird dort verwaltet.</p>
      )}

      {entry.source === 'birthday' && (
        <p className="calendar-detail-note">Geburtstag aus dem Profil bzw. den Kinder-Angaben - Änderungen dort vornehmen.</p>
      )}

      {entry.canManage && entry.source !== 'event' && (
        <div className="md-card-actions">
          <Button type="button" variant="ghost" onClick={onEdit}>
            {isSeries ? 'Serie bearbeiten' : 'Bearbeiten'}
          </Button>
          <Button type="button" variant="ghost" onClick={onDelete}>
            {isSeries ? 'Serie löschen' : 'Löschen'}
          </Button>
        </div>
      )}
    </section>
  );
}
