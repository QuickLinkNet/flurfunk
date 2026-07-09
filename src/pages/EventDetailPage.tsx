import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { RSVPButtonGroup } from '../components/molecules/RSVPButtonGroup';
import { EventResponseList } from '../components/organisms/EventResponseList';
import { Input } from '../components/atoms/Input';
import { Heading } from '../components/atoms/Heading';
import { fetchEvent, submitRsvp } from '../api/eventsApi';
import { EVENT_TYPE_META } from '../utils/eventTypeMeta';
import { formatDateTimeLabel } from '../utils/date';
import { useAuth } from '../hooks/useAuth';
import type { EventDetail, RsvpResponse } from '../types/event';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [response, setResponse] = useState<RsvpResponse | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reload = useCallback(() => {
    if (!id) return;
    fetchEvent(Number(id)).then((d) => {
      setDetail(d);
      const mine = user ? d.responses.find((r) => r.householdId === user.householdId) : undefined;
      setResponse(mine?.response ?? null);
      setNote(mine?.note ?? '');
    });
  }, [id, user]);

  useEffect(() => reload(), [reload]);

  async function handleRsvp(nextResponse: RsvpResponse) {
    if (!id) return;
    setResponse(nextResponse);
    setIsSubmitting(true);
    try {
      await submitRsvp(Number(id), { response: nextResponse, note: note || undefined });
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!detail) {
    return (
      <DashboardTemplate header={<Heading level={1}>Event</Heading>}>
        <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>
      </DashboardTemplate>
    );
  }

  const meta = EVENT_TYPE_META[detail.event.type];

  return (
    <DashboardTemplate header={<Heading level={1}>{detail.event.title}</Heading>}>
      <section>
        <p style={{ fontSize: 'var(--md-font-size-base)', color: 'var(--md-color-on-surface-variant)', margin: 0 }}>
          {meta.emoji} {meta.label} · {formatDateTimeLabel(detail.event.startsAt)}
          {detail.event.location ? ` · ${detail.event.location}` : ''}
        </p>
        {detail.event.description && (
          <p style={{ fontSize: 'var(--md-font-size-base)', marginTop: 'var(--md-space-2)' }}>
            {detail.event.description}
          </p>
        )}
      </section>
      <section>
        <Heading level={2}>Deine Rückmeldung</Heading>
        <RSVPButtonGroup value={response} onChange={handleRsvp} disabled={isSubmitting} />
        <Input
          placeholder='Notiz, z.B. "nur Thomas kommt" (optional)'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => response && handleRsvp(response)}
          maxLength={120}
          style={{ marginTop: 'var(--md-space-2)' }}
        />
      </section>
      <section>
        <Heading level={2}>Wer kommt</Heading>
        <EventResponseList responses={detail.responses} />
      </section>
    </DashboardTemplate>
  );
}
