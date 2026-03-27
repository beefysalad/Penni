import type { PlannedItem } from '@/features/finance/lib/finance.types';

export function getDaysUntil(value: string) {
  const today = new Date();
  const target = new Date(value);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getUpcomingTimingLabel(value: string) {
  const daysUntil = getDaysUntil(value);
  if (daysUntil < 0) return 'overdue';
  if (daysUntil === 0) return 'today';
  if (daysUntil === 1) return 'in 1 day';
  return `in ${daysUntil} days`;
}

export function getProjectedBalanceAfterRecurring(currentBalance: number, items: PlannedItem[]) {
  return items.reduce((total, item) => {
    const amount = Number(item.amount);
    return item.type === 'INCOME' ? total + amount : total - amount;
  }, currentBalance);
}

export function getNextPlannedItem(items: PlannedItem[], type: PlannedItem['type']) {
  return items
    .filter((item) => item.type === type)
    .sort((a, b) => {
      const aDate = new Date(a.nextOccurrenceAt ?? a.startDate).getTime();
      const bDate = new Date(b.nextOccurrenceAt ?? b.startDate).getTime();
      return aDate - bDate;
    })[0] ?? null;
}
