import { api } from '@/lib/api';
import type { Category, CategoryType } from '@/features/finance/lib/finance.types';

export type ListCategoriesParams = {
  type?: CategoryType;
};

export type CreateCategoryInput = {
  name: string;
  slug: string;
  type: CategoryType;
  colorHex?: string;
};

export async function listCategories(token: string, params?: ListCategoriesParams) {
  const response = await api.get<Category[]>('/categories', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function createCategory(token: string, input: CreateCategoryInput) {
  const response = await api.post<Category>('/categories', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}
