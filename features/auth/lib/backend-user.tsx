import { syncBackendUser } from '@/features/auth/lib/backend-user.api';
import { useAuth } from '@clerk/clerk-expo';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type BackendUser = {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type BackendUserContextValue = {
  user: BackendUser | null;
  isSyncing: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
};

const BackendUserContext = createContext<BackendUserContextValue | undefined>(undefined);

export function BackendUserProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSyncedForCurrentSignInRef = useRef(false);

  const refreshUser = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setUser(null);
      setError(null);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error('Unable to get Clerk token.');
      }

      const syncedUser = await syncBackendUser(token);
      setUser(syncedUser);
    } catch (syncError) {
      if (syncError instanceof Error && syncError.message === 'UNAUTHORIZED') {
        setUser(null);
        setError('Backend rejected the Clerk token. Check your Clerk backend keys.');
        return;
      }

      if (syncError instanceof Error) {
        setError(syncError.message);
        return;
      }

      setError('Failed to sync backend user.');
    } finally {
      setIsSyncing(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      hasSyncedForCurrentSignInRef.current = false;
      setUser(null);
      setError(null);
      setIsSyncing(false);
      return;
    }

    if (hasSyncedForCurrentSignInRef.current) {
      return;
    }

    hasSyncedForCurrentSignInRef.current = true;
    void refreshUser();
  }, [isLoaded, isSignedIn, refreshUser]);

  const value = useMemo(
    () => ({
      user,
      isSyncing,
      error,
      refreshUser,
    }),
    [error, isSyncing, refreshUser, user],
  );

  return <BackendUserContext.Provider value={value}>{children}</BackendUserContext.Provider>;
}

export function useBackendUser() {
  const context = useContext(BackendUserContext);

  if (!context) {
    throw new Error('useBackendUser must be used within a BackendUserProvider.');
  }

  return context;
}
