import { formatShortDate } from '@/features/finance/lib/formatters';
import type { CategoryType, PlannedItem, Transaction } from '@/features/finance/lib/finance.types';

export type RecurringStatus = 'UPCOMING' | 'DUE' | 'OVERDUE' | 'COMPLETE';

export type PlannedItemWithRecurringState = {
  item: PlannedItem;
  status: RecurringStatus;
  matchedTransaction: Transaction | null;
  scheduledFor: string;
};

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function isWithinWindow(target: Date, from: Date, to: Date) {
  return target >= from && target <= to;
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titlesLookRelated(left: string, right: string) {
  const normalizedLeft = normalizeTitle(left);
  const normalizedRight = normalizeTitle(right);

  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;
  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) {
    return Math.min(normalizedLeft.length, normalizedRight.length) >= 4;
  }

  const leftTokens = normalizedLeft.split(' ').filter((token) => token.length > 2);
  const rightTokens = normalizedRight.split(' ').filter((token) => token.length > 2);

  if (leftTokens.length === 0 || rightTokens.length === 0) return false;

  const sharedCount = leftTokens.filter((token) => rightTokens.includes(token)).length;
  return sharedCount >= Math.min(2, leftTokens.length, rightTokens.length);
}

export function getRecurringMatchForItem(item: PlannedItem, transactions: Transaction[]) {
  const scheduledFor = item.nextOccurrenceAt ?? item.startDate;
  const scheduledDate = startOfDay(new Date(scheduledFor));
  const windowStart = addDays(scheduledDate, -3);
  const windowEnd = addDays(scheduledDate, 5);

  return (
    transactions
      .filter((transaction) => {
        if (transaction.type !== item.type) return false;

        if (transaction.plannedItemId === item.id) {
          return true;
        }

        if (item.accountId && transaction.accountId !== item.accountId) return false;
        if (transaction.currency !== item.currency) return false;
        if (item.categoryId && transaction.categoryId !== item.categoryId) return false;
        if (Number(transaction.amount) !== Number(item.amount)) return false;

        const transactionDate = startOfDay(new Date(transaction.transactionAt));
        if (!isWithinWindow(transactionDate, windowStart, windowEnd)) return false;

        return titlesLookRelated(transaction.title, item.title);
      })
      .sort((a, b) => new Date(b.transactionAt).getTime() - new Date(a.transactionAt).getTime())[0] ?? null
  );
}

export function getPlannedItemRecurringState(item: PlannedItem, transactions: Transaction[]): PlannedItemWithRecurringState {
  const scheduledFor = item.nextOccurrenceAt ?? item.startDate;
  const matchedTransaction = getRecurringMatchForItem(item, transactions);

  if (matchedTransaction) {
    return {
      item,
      status: 'COMPLETE',
      matchedTransaction,
      scheduledFor,
    };
  }

  const today = startOfDay(new Date());
  const scheduledDate = startOfDay(new Date(scheduledFor));

  if (scheduledDate.getTime() < today.getTime()) {
    return {
      item,
      status: 'OVERDUE',
      matchedTransaction: null,
      scheduledFor,
    };
  }

  if (scheduledDate.getTime() === today.getTime()) {
    return {
      item,
      status: 'DUE',
      matchedTransaction: null,
      scheduledFor,
    };
  }

  return {
    item,
    status: 'UPCOMING',
    matchedTransaction: null,
    scheduledFor,
  };
}

export function getPlannedItemStatusLabel(status: RecurringStatus) {
  if (status === 'OVERDUE') return 'Overdue';
  if (status === 'DUE') return 'Due today';
  if (status === 'COMPLETE') return 'Complete';
  return 'Upcoming';
}

export function getCompletionActionLabel(type: CategoryType) {
  return type === 'INCOME' ? 'Mark received' : 'Mark paid';
}

export function getPlannedItemHelperText(plannedItem: PlannedItemWithRecurringState) {
  const actionLabel =
    plannedItem.item.type === 'INCOME' ? 'Mark it received' : 'Mark it paid';

  if (plannedItem.status === 'COMPLETE' && plannedItem.matchedTransaction) {
    return plannedItem.item.type === 'INCOME'
      ? `Matched deposit on ${formatShortDate(plannedItem.matchedTransaction.transactionAt)}.`
      : `Matched payment on ${formatShortDate(plannedItem.matchedTransaction.transactionAt)}.`;
  }

  if (plannedItem.status === 'DUE') {
    return `Expected today. ${actionLabel} once the transaction lands.`;
  }

  if (plannedItem.status === 'OVERDUE') {
    return `Expected on ${formatShortDate(plannedItem.scheduledFor)}.`;
  }

  return `Scheduled for ${formatShortDate(plannedItem.scheduledFor)}.`;
}

export function getPlannedItemSections(items: PlannedItemWithRecurringState[]) {
  const sortedItems = [...items].sort(
    (left, right) =>
      new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime(),
  );
  const itemType = items[0]?.item.type ?? 'EXPENSE';
  const overdueItems = sortedItems.filter((item) => item.status === 'OVERDUE');
  const dueItems = sortedItems.filter((item) => item.status === 'DUE');
  const upcomingItems = sortedItems.filter((item) => item.status === 'UPCOMING');
  const completedItems = sortedItems.filter((item) => item.status === 'COMPLETE');

  return [
    { title: 'Overdue', items: overdueItems },
    { title: 'Due today', items: dueItems },
    { title: 'Upcoming', items: upcomingItems },
    { title: itemType === 'INCOME' ? 'Received' : 'Paid', items: completedItems },
  ].filter((section) => section.items.length > 0);
}
