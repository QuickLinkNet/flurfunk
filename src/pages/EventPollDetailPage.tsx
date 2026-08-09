import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { RSVPButtonGroup } from '../components/molecules/RSVPButtonGroup';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { Button } from '../components/atoms/Button';
import { Heading } from '../components/atoms/Heading';
import { StatusPill } from '../components/atoms/StatusPill';
import { deleteEventPoll, fetchEventPoll, finalizeEventPoll, voteEventPoll } from '../api/eventPollApi';
import { EVENT_TYPE_META } from '../utils/eventTypeMeta';
import { formatDateTimeLabel } from '../utils/date';
import type { RsvpResponse } from '../types/event';
import type { EventPoll } from '../types/eventPoll';

export function EventPollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<EventPoll | null>(null);
  const [draft, setDraft] = useState<Record<number, RsvpResponse | null>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [finalizingOptionId, setFinalizingOptionId] = useState<number | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const reload = useCallback(() => {
    if (!id) return;
    fetchEventPoll(Number(id)).then((result) => {
      setPoll(result);
      const nextDraft: Record<number, RsvpResponse | null> = {};
      result.options.forEach((option) => {
        nextDraft[option.id] = option.myResponse;
      });
      setDraft(nextDraft);
    });
  }, [id]);

  useEffect(() => reload(), [reload]);

  async function saveVotes() {
    if (!poll) return;
    const votes = Object.entries(draft)
      .filter(([, response]) => response !== null)
      .map(([optionId, response]) => ({ optionId: Number(optionId), response: response as RsvpResponse }));
    if (votes.length === 0) {
      setMessage('Bitte mindestens einen Termin beantworten.');
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      await voteEventPoll(poll.id, votes);
      setMessage('Antworten gespeichert.');
      reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Antworten konnten nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmFinalize() {
    if (!poll || finalizingOptionId === null) return;
    setIsFinalizing(true);
    try {
      const result = await finalizeEventPoll(poll.id, finalizingOptionId);
      setFinalizingOptionId(null);
      navigate(`/events/${result.eventId}`, { replace: true });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Termin konnte nicht festgelegt werden.');
      setFinalizingOptionId(null);
    } finally {
      setIsFinalizing(false);
    }
  }

  async function confirmDelete() {
    if (!poll) return;
    setIsDeleting(true);
    try {
      await deleteEventPoll(poll.id);
      navigate('/events');
    } finally {
      setIsDeleting(false);
    }
  }

  if (!poll) {
    return (
      <DashboardTemplate pageTitle="Terminfindung" pageSubtitle="Details werden geladen.">
        <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>
      </DashboardTemplate>
    );
  }

  const meta = EVENT_TYPE_META[poll.type];
  const headerAside = poll.canManage && poll.status === 'open' ? (
    <div className="event-detail-actions">
      <Button type="button" variant="ghost" onClick={() => setConfirmDeleteOpen(true)}>
        Löschen
      </Button>
    </div>
  ) : null;

  return (
    <DashboardTemplate
      pageTitle={poll.title}
      pageSubtitle={`${meta.emoji} ${meta.label} · ${poll.options.length} Terminvorschläge${poll.location ? ` · ${poll.location}` : ''}`}
      headerAside={headerAside}
    >
      {poll.status === 'closed' && poll.resultingEventId !== null && (
        <section>
          <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0, color: 'var(--md-color-secondary)' }}>
            Termin steht! <Link to={`/events/${poll.resultingEventId}`}>Zum Event</Link>
          </p>
        </section>
      )}

      {poll.description && (
        <section>
          <p style={{ fontSize: 'var(--md-font-size-base)', margin: 0 }}>{poll.description}</p>
        </section>
      )}

      <section>
        <Heading level={2}>Welche Termine passen dir?</Heading>
        <div style={{ display: 'grid', gap: 'var(--md-space-3)' }}>
          {poll.options.map((option) => (
            <div
              key={option.id}
              style={{
                display: 'grid',
                gap: 'var(--md-space-2)',
                padding: 'var(--md-space-3)',
                border: '1px solid var(--md-color-border)',
                borderRadius: 'var(--md-radius-card)',
                background: 'var(--md-color-surface)'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--md-space-2)' }}>
                <strong style={{ fontSize: 'var(--md-font-size-base)' }}>{formatDateTimeLabel(option.startsAt)}</strong>
                <div style={{ display: 'flex', gap: 'var(--md-space-1)' }}>
                  <StatusPill label={`${option.yesCount} kann`} tone="success" />
                  <StatusPill label={`${option.maybeCount} vielleicht`} />
                  <StatusPill label={`${option.noCount} geht nicht`} />
                </div>
              </div>
              {poll.status === 'open' && (
                <RSVPButtonGroup
                  value={draft[option.id] ?? null}
                  onChange={(response) => setDraft((current) => ({ ...current, [option.id]: response }))}
                  disabled={isSaving}
                />
              )}
              {poll.canManage && poll.status === 'open' && (
                <Button type="button" variant="ghost" onClick={() => setFinalizingOptionId(option.id)}>
                  Diesen Termin festlegen
                </Button>
              )}
            </div>
          ))}
        </div>
        {poll.status === 'open' && (
          <Button type="button" style={{ marginTop: 'var(--md-space-3)' }} disabled={isSaving} onClick={saveVotes}>
            {isSaving ? 'Speichert …' : 'Antworten speichern'}
          </Button>
        )}
        {message && <p style={{ margin: 'var(--md-space-2) 0 0', fontSize: 'var(--md-font-size-sm)', color: 'var(--md-color-on-surface-variant)' }}>{message}</p>}
      </section>

      <ConfirmDialog
        open={finalizingOptionId !== null}
        title="Termin festlegen?"
        description="Aus diesem Termin wird ein echtes Event. Alle Nachbarn bekommen eine Push-Benachrichtigung."
        confirmLabel="Termin festlegen"
        loading={isFinalizing}
        onCancel={() => setFinalizingOptionId(null)}
        onConfirm={confirmFinalize}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Terminfindung löschen?"
        description={`Soll "${poll.title}" wirklich gelöscht werden? Alle Stimmen gehen verloren.`}
        confirmLabel="Löschen"
        loading={isDeleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </DashboardTemplate>
  );
}
