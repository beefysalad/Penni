import { api } from '@/lib/api';
import type { Debt, DebtDirection } from '@/features/finance/lib/finance.types';

export type CreateDebtInput = {
  direction: DebtDirection;
  title: string;
  counterpartyName: string;
  originalAmount: string;
  currentBalance?: string;
  currency: string;
  dueDate?: string;
  notes?: string;
};

export async function listDebts(token: string) {
  const response = await api.get<Debt[]>('/debts', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function createDebt(token: string, input: CreateDebtInput) {
  const response = await api.post<Debt>('/debts', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function deleteDebt(token: string, id: string) {
  const response = await api.delete<Debt>(`/debts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}
