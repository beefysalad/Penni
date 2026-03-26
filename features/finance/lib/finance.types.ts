export type AccountType = 'CASH' | 'BANK_ACCOUNT' | 'E_WALLET' | 'CREDIT_CARD' | 'OTHER';
export type CategoryType = 'EXPENSE' | 'INCOME';
export type TransactionSource = 'MANUAL' | 'RECURRING' | 'IMPORTED';
export type RecurrenceFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type Account = {
  id: string;
  clientId: string | null;
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: string;
  institutionName: string | null;
  isArchived: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  clientUpdatedAt: string | null;
};

export type Category = {
  id: string;
  clientId: string | null;
  userId: string;
  name: string;
  slug: string;
  type: CategoryType;
  icon: string | null;
  colorHex: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  clientUpdatedAt: string | null;
};

export type Transaction = {
  id: string;
  clientId: string | null;
  userId: string;
  accountId: string | null;
  categoryId: string | null;
  plannedItemId: string | null;
  type: CategoryType;
  source: TransactionSource;
  title: string;
  notes: string | null;
  amount: string;
  currency: string;
  transactionAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  clientUpdatedAt: string | null;
};

export type PlannedItem = {
  id: string;
  clientId: string | null;
  userId: string;
  accountId: string | null;
  categoryId: string | null;
  type: CategoryType;
  title: string;
  notes: string | null;
  amount: string;
  currency: string;
  startDate: string;
  recurrence: RecurrenceFrequency;
  isActive: boolean;
  nextOccurrenceAt: string | null;
  lastProcessedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  clientUpdatedAt: string | null;
};
