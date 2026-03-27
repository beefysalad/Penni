import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  type CreateTransactionInput,
  type ListTransactionsParams,
  type PaginatedTransactionsResponse,
} from '@/features/finance/api/transactions.api';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const transactionsQueryKey = (params?: ListTransactionsParams) =>
  ['transactions', params ?? {}] as const;

/**
 * Original non-paginated query — kept for backward compatibility (dashboard, etc.)
 * Returns all transactions as a flat array by auto-paginating under the hood.
 */
export function useTransactionsQuery(params?: ListTransactionsParams) {
  const authenticatedRequest = useAuthenticatedRequest();

  return useQuery({
    queryKey: transactionsQueryKey(params),
    queryFn: async () => {
      const res = await authenticatedRequest((token) => listTransactions(token, params));
      return res.data;
    },
  });
}

/**
 * Infinite-scroll paginated query — used by the Activity screen.
 */
export function useTransactionsInfiniteQuery(params?: Omit<ListTransactionsParams, 'cursor'>) {
  const authenticatedRequest = useAuthenticatedRequest();

  return useInfiniteQuery<PaginatedTransactionsResponse, Error>({
    queryKey: ['transactions', 'infinite', params ?? {}],
    queryFn: ({ pageParam }) =>
      authenticatedRequest((token) =>
        listTransactions(token, {
          ...params,
          cursor: pageParam as string | undefined,
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
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
