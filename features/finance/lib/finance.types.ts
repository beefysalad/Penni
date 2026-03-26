export type AccountType = 'CASH' | 'BANK_ACCOUNT' | 'E_WALLET' | 'CREDIT_CARD' | 'OTHER';
export type CategoryType = 'EXPENSE' | 'INCOME';

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
