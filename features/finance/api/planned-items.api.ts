import { api } from '@/lib/api';
import type { CategoryType, PlannedItem, RecurrenceFrequency } from '@/features/finance/lib/finance.types';

export type ListPlannedItemsParams = {
  type?: CategoryType;
  accountId?: string;
  categoryId?: string;
  isActive?: boolean;
};

export type CreatePlannedItemInput = {
  accountId?: string;
  categoryId?: string;
  type: CategoryType;
  title: string;
  notes?: string;
  amount: string;
  currency: string;
  startDate: string;
  recurrence: RecurrenceFrequency;
  isActive?: boolean;
};

export async function listPlannedItems(token: string, params?: ListPlannedItemsParams) {
  const response = await api.get<PlannedItem[]>('/planned-items', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function createPlannedItem(token: string, input: CreatePlannedItemInput) {
  const response = await api.post<PlannedItem>('/planned-items', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function deletePlannedItem(token: string, id: string) {
  const response = await api.delete<{ id: string }>(`/planned-items/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return response.data;
}
