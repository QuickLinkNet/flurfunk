import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { RSVPButtonGroup } from '../components/molecules/RSVPButtonGroup';
import { EventResponseList } from '../components/organisms/EventResponseList';
import { Input } from '../components/atoms/Input';
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
      <DashboardTemplate header={<h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Event</h1>}>
        <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)' }}>Lädt …</p>
      </DashboardTemplate>
    );
  }

  const meta = EVENT_TYPE_META[detail.event.type];

  return (
    <DashboardTemplate header={<h1 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{detail.event.title}</h1>}>
      <section>
        <p style={{ fontSize: 13, color: 'var(--md-color-on-surface-variant)', margin: 0 }}>
          {meta.emoji} {meta.label} · {formatDateTimeLabel(detail.event.startsAt)}
          {detail.event.location ? ` · ${detail.event.location}` : ''}
        </p>
        {detail.event.description && (
          <p style={{ fontSize: 13, marginTop: 8 }}>{detail.event.description}</p>
        )}
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Deine Rückmeldung</h2>
        <RSVPButtonGroup value={response} onChange={handleRsvp} disabled={isSubmitting} />
        <Input
          placeholder='Notiz, z.B. "nur Thomas kommt" (optional)'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => response && handleRsvp(response)}
          maxLength={120}
          style={{ marginTop: 8 }}
        />
      </section>
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 500 }}>Wer kommt</h2>
        <EventResponseList responses={detail.responses} />
      </section>
    </DashboardTemplate>
  );
}
