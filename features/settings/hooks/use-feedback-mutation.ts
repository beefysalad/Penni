import { useAuthenticatedRequest } from '@/features/auth/lib/use-authenticated-request';
import { createFeedback, type CreateFeedbackInput } from '@/features/settings/api/feedback.api';
import { useMutation } from '@tanstack/react-query';

export function useCreateFeedbackMutation() {
  const authenticatedRequest = useAuthenticatedRequest();

  return useMutation({
    mutationFn: (input: CreateFeedbackInput) =>
      authenticatedRequest((token) => createFeedback(token, input)),
  });
}
