import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import {
  createBudget,
  deleteBudget,
  listBudgets,
  type CreateBudgetInput,
} from '@/features/finance/api/budgets.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const budgetsQueryKey = ['budgets'] as const;

export function useBudgetsQuery() {
  const authenticatedRequest = useAuthenticatedRequest();

  return useQuery({
    queryKey: budgetsQueryKey,
    queryFn: () => authenticatedRequest((token) => listBudgets(token)),
  });
}

export function useCreateBudgetMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBudgetInput) =>
      authenticatedRequest((token) => createBudget(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetsQueryKey });
    },
  });
}

export function useDeleteBudgetMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteBudget(token, id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetsQueryKey });
    },
  });
}
