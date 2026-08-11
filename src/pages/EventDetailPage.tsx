import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { RSVPButtonGroup } from '../components/molecules/RSVPButtonGroup';
import { ActionDialog } from '../components/molecules/ActionDialog';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { EventResponseList } from '../components/organisms/EventResponseList';
import { NewEventForm } from '../components/organisms/NewEventForm';
import { Input } from '../components/atoms/Input';
import { Heading } from '../components/atoms/Heading';
import { Button } from '../components/atoms/Button';
import { deleteEvent, fetchEvent, sendEventReminder, submitRsvp } from '../api/eventsApi';
import { EVENT_TYPE_META } from '../utils/eventTypeMeta';
import { formatDateRangeLabel } from '../utils/date';
import { recurrenceSummary } from '../utils/recurrenceLabels';
import { useAuth } from '../hooks/useAuth';
import type { EventDetail, RsvpResponse } from '../types/event';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [response, setResponse] = useState<RsvpResponse | null>(null);
  const [adultsCount, setAdultsCount] = useState('');
  const [childrenCount, setChildrenCount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isReminding, setIsReminding] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!id) return;
    fetchEvent(Number(id)).then((d) => {
      setDetail(d);
      const mine = user ? d.responses.find((r) => r.householdId === user.householdId) : undefined;
      setResponse(mine?.response ?? null);
      setAdultsCount(mine?.adultsCount != null ? String(mine.adultsCount) : '');
      setChildrenCount(mine?.childrenCount != null ? String(mine.childrenCount) : '');
      setNote(mine?.note ?? '');
    });
  }, [id, user]);

  useEffect(() => reload(), [reload]);

  async function saveRsvp(nextResponse = response) {
    if (!id || !nextResponse) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      await submitRsvp(Number(id), {
        response: nextResponse,
        adultsCount: adultsCount ? Number(adultsCount) : undefined,
        childrenCount: childrenCount ? Number(childrenCount) : undefined,
        note: note || undefined
      });
      setMessage('Rückmeldung gespeichert.');
      reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Rückmeldung konnte nicht gespeichert werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRsvp(nextResponse: RsvpResponse) {
    setResponse(nextResponse);
  }

  async function handleRemind() {
    if (!detail) return;
    setIsReminding(true);
    setReminderMessage(null);
    try {
      const result = await sendEventReminder(detail.event.id);
      setReminderMessage(
        result.remindedHouseholds > 0
          ? `Erinnerung an ${result.remindedHouseholds} Haushalt(e) ohne Rückmeldung gesendet (${result.push.sent}/${result.push.total} Pushes zugestellt).`
          : 'Alle Haushalte haben schon geantwortet - keine Erinnerung nötig.'
      );
    } catch (err) {
      setReminderMessage(err instanceof Error ? err.message : 'Erinnerung konnte nicht gesendet werden.');
    } finally {
      setIsReminding(false);
    }
  }

  async function confirmDelete() {
    if (!detail) return;
    setIsDeleting(true);
    try {
      await deleteEvent(detail.event.id);
      navigate('/events');
    } finally {
      setIsDeleting(false);
    }
  }

  if (!detail) {
    return (
      <DashboardTemplate pageTitle="Event" pageSubtitle="Details werden geladen.">
        <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>
      </DashboardTemplate>
    );
  }

  const meta = EVENT_TYPE_META[detail.event.type];
  const isRecurring = detail.event.recurrenceRule !== 'none';
  const displayStartsAt = detail.event.nextOccurrenceAt ?? detail.event.startsAt;

  const eventMeta = `${meta.emoji} ${meta.label} · ${formatDateRangeLabel(displayStartsAt, isRecurring ? null : detail.event.endsAt)}${detail.event.location ? ` · ${detail.event.location}` : ''}${isRecurring ? ` · ${recurrenceSummary(detail.event.recurrenceRule, detail.event.recurrenceUntil)}` : ''}`;
  const headerAside = detail.event.canManage ? (
    <div>
      <div className="event-detail-actions">
        <Button type="button" variant="ghost" onClick={() => setIsEditing(true)}>
          Bearbeiten
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirmDeleteOpen(true)}>
          Löschen
        </Button>
        <Button type="button" variant="ghost" disabled={isReminding} onClick={handleRemind}>
          {isReminding ? 'Sendet ...' : 'Erinnerung senden'}
        </Button>
      </div>
      {reminderMessage && <p className="event-rsvp-message">{reminderMessage}</p>}
    </div>
  ) : null;

  return (
    <DashboardTemplate pageTitle={detail.event.title} pageSubtitle={eventMeta} headerAside={headerAside}>
      {detail.event.photoUrl && (
        <img
          src={detail.event.photoUrl}
          alt=""
          style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 'var(--md-radius-card)' }}
        />
      )}
      {detail.event.description && (
        <section>
          <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0 }}>
            {detail.event.description}
          </p>
        </section>
      )}
      <section>
        <Heading level={2}>Deine Rückmeldung</Heading>
        <RSVPButtonGroup value={response} onChange={handleRsvp} disabled={isSubmitting} />
        <div className="event-rsvp-details">
          <Input
            type="number"
            min="0"
            placeholder="Erwachsene"
            value={adultsCount}
            onChange={(event) => setAdultsCount(event.target.value)}
          />
          <Input
            type="number"
            min="0"
            placeholder="Kinder"
            value={childrenCount}
            onChange={(event) => setChildrenCount(event.target.value)}
          />
        </div>
        <Input
          placeholder='Notiz, z.B. "nur Thomas kommt" (optional)'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={120}
        />
        <Button className="event-rsvp-save" type="button" disabled={isSubmitting || !response} onClick={() => saveRsvp()}>
          {isSubmitting ? 'Speichert ...' : 'Rückmeldung speichern'}
        </Button>
        {message && <p className="event-rsvp-message">{message}</p>}
      </section>
      <section>
        <Heading level={2}>Wer kommt</Heading>
        <EventResponseList responses={detail.responses} />
      </section>
      <ActionDialog open={isEditing} title="Event bearbeiten" onClose={() => setIsEditing(false)}>
        <NewEventForm
          event={detail.event}
          onCreated={() => {
            setIsEditing(false);
            reload();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </ActionDialog>
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Event löschen?"
        description={`Soll "${detail.event.title}" wirklich gelöscht werden?`}
        confirmLabel="Löschen"
        loading={isDeleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </DashboardTemplate>
  );
}
