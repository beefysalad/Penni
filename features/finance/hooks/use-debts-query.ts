import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import { createDebt, deleteDebt, listDebts, type CreateDebtInput } from '@/features/finance/api/debts.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const debtsQueryKey = ['debts'] as const;

export function useDebtsQuery() {
  const authenticatedRequest = useAuthenticatedRequest();

  return useQuery({
    queryKey: debtsQueryKey,
    queryFn: () => authenticatedRequest((token) => listDebts(token)),
  });
}

export function useCreateDebtMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDebtInput) =>
      authenticatedRequest((token) => createDebt(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: debtsQueryKey });
    },
  });
}

export function useDeleteDebtMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteDebt(token, id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: debtsQueryKey });
    },
  });
}
