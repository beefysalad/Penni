import { api } from '@/lib/api';
import type { CategoryType, Transaction, TransactionSource } from '@/features/finance/lib/finance.types';

export type ListTransactionsParams = {
  type?: CategoryType;
  accountId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
};

export type PaginatedTransactionsResponse = {
  data: Transaction[];
  nextCursor: string | null;
  hasMore: boolean;
  summary: {
    totalIncome: string;
    totalExpense: string;
  };
};

export type CreateTransactionInput = {
  accountId?: string;
  categoryId?: string;
  plannedItemId?: string;
  type: CategoryType;
  source?: TransactionSource;
  title: string;
  notes?: string;
  amount: string;
  currency: string;
  transactionAt: string;
};

export type CreateTransferInput = {
  fromAccountId: string;
  toAccountId: string;
  title?: string;
  notes?: string;
  amount: string;
  transactionAt: string;
};

export type CreateTransferResponse = {
  outgoingTransaction: Transaction;
  incomingTransaction: Transaction;
};

export async function listTransactions(
  token: string,
  params?: ListTransactionsParams,
): Promise<PaginatedTransactionsResponse> {
  const response = await api.get<PaginatedTransactionsResponse>('/transactions', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function createTransaction(token: string, input: CreateTransactionInput) {
  const response = await api.post<Transaction>('/transactions', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function createTransfer(token: string, input: CreateTransferInput) {
  const response = await api.post<CreateTransferResponse>('/transactions/transfers', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function deleteTransaction(token: string, id: string) {
  const response = await api.delete<Transaction>(`/transactions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}
