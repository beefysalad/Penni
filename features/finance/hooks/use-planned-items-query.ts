import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import {
  createPlannedItem,
  listPlannedItems,
  deletePlannedItem,
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

export function useDeletePlannedItemMutation() {
  const authenticatedRequest = useAuthenticatedRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deletePlannedItem(token, id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['planned-items'] });
      const previousItems = queryClient.getQueryData(['planned-items', {}]);
      queryClient.setQueryData(['planned-items', {}], (old: any) => ({
        ...old,
        data: old?.data?.filter((i: any) => i.id !== id) ?? [],
      }));
      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['planned-items', {}], context.previousItems);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['planned-items'] });
    },
  });
}
