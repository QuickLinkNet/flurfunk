import { Link } from 'react-router-dom';
import { HouseholdAvatar } from '../atoms/HouseholdAvatar';
import { FeatureIcon } from '../atoms/FeatureIcon';
import { CHILD_LOCATION_LABELS } from '../../types/child';
import type { NeighborEvent, NeighborHousehold } from '../../types/neighbor';

interface Props {
  household: NeighborHousehold;
}

function formatStatusDate(value: string | null): string {
  if (!value) return 'Noch nicht aktualisiert';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Noch nicht aktualisiert';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function statusTone(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes('urlaub')) return 'vacation';
  if (normalized.includes('hilfe')) return 'help';
  if (normalized.includes('unterwegs')) return 'away';
  return 'home';
}

function statusIcon(label: string | null | undefined): 'home' | 'help' | 'briefcase' | 'lock' {
  const normalized = (label ?? '').toLowerCase();
  if (normalized.includes('hilfe')) return 'help';
  if (normalized.includes('urlaub') || normalized.includes('unterwegs')) return 'briefcase';
  if (!label) return 'lock';
  return 'home';
}

function formatEventDate(event: NeighborEvent): string {
  const date = new Date(event.startsAt.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Termin ohne gültiges Datum';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function privateText(label: string): string {
  return `${label} privat`;
}

export function NeighborCard({ household }: Props) {
  const status = household.status;
  const statusLabel = status?.label ?? 'Status privat';
  const hiddenFields: string[] = [
    !household.statusVisible ? privateText('Status') : null,
    !household.vacationVisible ? privateText('Urlaub') : null,
    !household.childrenVisible ? privateText('Kinder') : null,
    !household.eventsVisible ? privateText('Events') : null,
    !household.contactVisible ? privateText('Kontakt') : null
  ].filter((entry): entry is string => entry !== null);

  return (
    <article className="neighbor-card" data-status={status ? statusTone(status.label) : 'private'}>
      <div className="neighbor-card-main">
        <div className="neighbor-card-avatar">
          <HouseholdAvatar avatarKey={household.avatarKey} fallback={household.name} size={64} />
          <span className="neighbor-card-status-dot" aria-hidden="true" />
        </div>
        <div>
          <div className="neighbor-card-title-row">
            <h2>{household.name}</h2>
            {household.isOwnHousehold && <span>Du</span>}
          </div>
          <p>{household.addressLine}</p>
        </div>
      </div>

      <div className="neighbor-card-status">
        <FeatureIcon name={statusIcon(status?.label)} size={44} />
        <div>
          <strong>{statusLabel}</strong>
          {status?.note && <p>{status.note}</p>}
          <small>{status ? `Stand: ${formatStatusDate(status.updatedAt)}` : 'Dieser Haushalt teilt seinen Status nicht.'}</small>
        </div>
      </div>

      {hiddenFields.length > 0 && (
        <div className="neighbor-card-privacy" aria-label="Private Bereiche">
          {hiddenFields.map((entry) => (
            <span key={entry}>{entry}</span>
          ))}
        </div>
      )}

      <div className="neighbor-card-sections">
        {household.vacationVisible && (
          <section>
            <h3>Urlaub</h3>
            {household.vacation ? (
              <p>{household.vacation.note ?? household.vacation.label}</p>
            ) : (
              <p>Aktuell kein Urlaubsstatus.</p>
            )}
          </section>
        )}
        {household.childrenVisible && (
          <section>
            <h3>Kinder</h3>
            {household.children.length > 0 ? (
              <ul>
                {household.children.map((child) => (
                  <li key={child.id}>
                    <strong>{child.name}</strong>
                    <span>{child.locationNote ?? CHILD_LOCATION_LABELS[child.currentLocation]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Keine Kinder-Status geteilt.</p>
            )}
          </section>
        )}
        {household.eventsVisible && (
          <section>
            <h3>Geplante Events</h3>
            {household.events.length > 0 ? (
              <ul>
                {household.events.map((event) => (
                  <li key={event.id}>
                    <Link to={`/events/${event.id}`}>{event.title}</Link>
                    <span>{formatEventDate(event)}{event.location ? ` · ${event.location}` : ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Keine kommenden Events.</p>
            )}
          </section>
        )}
        {household.contactVisible && (
          <section>
            <h3>Kontakt</h3>
            {household.contact ? <p>{household.contact}</p> : <p>Kein Kontakthinweis hinterlegt.</p>}
          </section>
        )}
      </div>

      {household.isOwnHousehold ? (
        <Link className="neighbor-card-action" to="/haushalt/mein">
          <FeatureIcon name="settings" size={32} />
          Eigenen Haushalt bearbeiten
        </Link>
      ) : (
        <div className="neighbor-card-action" aria-label="Nachbarschaftshaushalt">
          <FeatureIcon name="users" size={32} />
          Sichtbar in deiner Straße
        </div>
      )}
    </article>
  );
}
