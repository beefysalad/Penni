import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  type CreateTransactionInput,
  type ListTransactionsParams,
} from '@/features/finance/api/transactions.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const transactionsQueryKey = (params?: ListTransactionsParams) =>
  ['transactions', params ?? {}] as const;

export function useTransactionsQuery(params?: ListTransactionsParams) {
  const authenticatedRequest = useAuthenticatedRequest();

  return useQuery({
    queryKey: transactionsQueryKey(params),
    queryFn: () => authenticatedRequest((token) => listTransactions(token, params)),
  });
}

export function useCreateTransactionMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      authenticatedRequest((token) => createTransaction(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransactionMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteTransaction(token, id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
