import { api } from '@/lib/api';
import type { Budget } from '@/features/finance/lib/finance.types';

export type CreateBudgetInput = {
  categoryId?: string;
  name?: string;
  amount: string;
  currency: string;
  alertThreshold?: number;
  periodStart: string;
  periodEnd: string;
};

export async function listBudgets(token: string) {
  const response = await api.get<Budget[]>('/budgets', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function createBudget(token: string, input: CreateBudgetInput) {
  const response = await api.post<Budget>('/budgets', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function deleteBudget(token: string, id: string) {
  const response = await api.delete<Budget>(`/budgets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}
