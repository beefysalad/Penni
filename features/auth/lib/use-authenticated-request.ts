import { useAuth } from '@clerk/clerk-expo';
import { useCallback } from 'react';

export function useAuthenticatedRequest() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useCallback(
    async <T>(request: (token: string) => Promise<T>) => {
      if (!isLoaded || !isSignedIn) {
        throw new Error('You must be signed in to make this request.');
      }

      const token = await getToken();

      if (!token) {
        throw new Error('Unable to get Clerk token.');
      }

      return request(token);
    },
    [getToken, isLoaded, isSignedIn],
  );
}
