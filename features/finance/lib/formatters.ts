import type { RecurrenceFrequency } from '@/features/finance/lib/finance.types';

export function formatCurrency(
  value: number | string,
  currency = 'PHP',
  options?: Intl.NumberFormatOptions,
) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value;

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatShortDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatCompactDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export function formatGroupDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return new Intl.DateTimeFormat('en-PH', { weekday: 'long' }).format(date);
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;

  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export function formatPeriod(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const formatter = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' });
  return `${formatter.format(s)} – ${formatter.format(e)}`;
}

export function formatDueDayOfMonth(day: number | null | undefined) {
  if (!day) return null;

  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? 'st'
      : day % 10 === 2 && day % 100 !== 12
        ? 'nd'
        : day % 10 === 3 && day % 100 !== 13
          ? 'rd'
          : 'th';

  return `${day}${suffix}`;
}

export function formatRecurrenceLabel(
  recurrence: RecurrenceFrequency,
  semiMonthlyDays?: number[] | null,
) {
  switch (recurrence) {
    case 'WEEKLY':
      return 'Weekly';
    case 'MONTHLY':
      return 'Monthly';
    case 'SEMI_MONTHLY':
      if (semiMonthlyDays && semiMonthlyDays.length === 2) {
        const sortedDays = [...semiMonthlyDays].sort((a, b) => a - b);
        const [firstDay, secondDay] = sortedDays;
        return `${formatDueDayOfMonth(firstDay)} & ${formatDueDayOfMonth(secondDay)}`;
      }
      return 'Semi-monthly';
    case 'QUARTERLY':
      return 'Quarterly';
    case 'YEARLY':
      return 'Yearly';
  }
}

export function formatRecurrencePhrase(
  recurrence: RecurrenceFrequency,
  semiMonthlyDays?: number[] | null,
) {
  switch (recurrence) {
    case 'WEEKLY':
      return 'every week';
    case 'MONTHLY':
      return 'every month';
    case 'SEMI_MONTHLY':
      if (semiMonthlyDays && semiMonthlyDays.length === 2) {
        const sortedDays = [...semiMonthlyDays].sort((a, b) => a - b);
        const [firstDay, secondDay] = sortedDays;
        return `twice a month on the ${formatDueDayOfMonth(firstDay)} and ${formatDueDayOfMonth(secondDay)}`;
      }
      return 'twice a month';
    case 'QUARTERLY':
      return 'every quarter';
    case 'YEARLY':
      return 'every year';
  }
}
