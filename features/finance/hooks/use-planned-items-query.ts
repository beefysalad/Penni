import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import {
  createPlannedItem,
  listPlannedItems,
  type CreatePlannedItemInput,
  type ListPlannedItemsParams,
} from '@/features/finance/api/planned-items.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const plannedItemsQueryKey = (params?: ListPlannedItemsParams) =>
  ['planned-items', params ?? {}] as const;

export function usePlannedItemsQuery(params?: ListPlannedItemsParams) {
  const authenticatedRequest = useAuthenticatedRequest();

  return useQuery({
    queryKey: plannedItemsQueryKey(params),
    queryFn: () => authenticatedRequest((token) => listPlannedItems(token, params)),
  });
}

export function useCreatePlannedItemMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlannedItemInput) =>
      authenticatedRequest((token) => createPlannedItem(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['planned-items'] });
    },
  });
}
