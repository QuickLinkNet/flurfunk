// Kleine Datumshelfer, keine externe Bibliothek nötig (z.B. keine date-fns).
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function addMonths(d: Date, amount: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + amount, 1);
}

export function formatDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function formatMonthLabel(d: Date): string {
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

export function formatDateTimeLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateRangeLabel(startsAt: string, endsAt?: string | null): string {
  if (!endsAt) return formatDateTimeLabel(startsAt);

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    const startLabel = start.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const endLabel = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${startLabel} bis ${endLabel}`;
  }

  return `${formatDateTimeLabel(startsAt)} bis ${formatDateTimeLabel(endsAt)}`;
}
