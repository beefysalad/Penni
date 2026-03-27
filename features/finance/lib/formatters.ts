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
