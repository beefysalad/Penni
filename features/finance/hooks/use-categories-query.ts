import {
  createCategory,
  listCategories,
  type CreateCategoryInput,
  type ListCategoriesParams,
} from '@/features/finance/api/categories.api';
import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import type { CategoryType } from '@/features/finance/lib/finance.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const categoriesQueryKey = (type?: CategoryType) => ['categories', type ?? 'all'] as const;

export function useCategoriesQuery(params?: ListCategoriesParams) {
  const authenticatedRequest = useAuthenticatedRequest();
  const type = params?.type;

  return useQuery({
    queryKey: categoriesQueryKey(type),
    queryFn: () => authenticatedRequest((token) => listCategories(token, params)),
  });
}

export function useCreateCategoryMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      authenticatedRequest((token) => createCategory(token, input)),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesQueryKey() }),
        queryClient.invalidateQueries({ queryKey: categoriesQueryKey(variables.type) }),
      ]);
    },
  });
}
