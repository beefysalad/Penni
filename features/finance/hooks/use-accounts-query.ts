import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import {
  createAccount,
  deleteAccount,
  listAccounts,
  type CreateAccountInput,
} from '@/features/finance/api/accounts.api';
import type { Account } from '@/features/finance/lib/finance.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const accountsQueryKey = ['accounts'] as const;

export function useAccountsQuery() {
  const authenticatedRequest = useAuthenticatedRequest();

  return useQuery({
    queryKey: accountsQueryKey,
    queryFn: () => authenticatedRequest((token) => listAccounts(token)),
  });
}

export function useCreateAccountMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      authenticatedRequest((token) => createAccount(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}

export function useDeleteAccountMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteAccount(token, id)),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: accountsQueryKey });

      const previousAccounts = queryClient.getQueryData<Account[]>(accountsQueryKey);

      queryClient.setQueryData<Account[]>(accountsQueryKey, (current = []) =>
        current.filter((account) => account.id !== id),
      );

      return { previousAccounts };
    },
    onError: (_error, _id, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(accountsQueryKey, context.previousAccounts);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}
