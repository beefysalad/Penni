import '@/global.css';

import { BackendUserProvider, useBackendUser } from '@/features/auth/lib/backend-user';
import { TransactionComposeProvider } from '@/features/finance/lib/transaction-compose-context';
import { env } from '@/lib/env';
import { queryClient } from '@/lib/query-client';
import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ClerkProvider publishableKey={env.expoClerkPK} tokenCache={tokenCache}>
      <BackendUserProvider>
        <TransactionComposeProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Routes />
              <PortalHost />
            </ThemeProvider>
          </QueryClientProvider>
        </TransactionComposeProvider>
      </BackendUserProvider>
    </ClerkProvider>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isSyncing } = useBackendUser();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn && isSyncing) {
    return null;
  }

  return (
    <Stack>
      {/* Screens only shown when the user is NOT signed in */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/verify-sign-in" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/reset-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens only shown when the user IS signed in */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)/index" options={APP_SCREEN_OPTIONS} />
        <Stack.Screen name="(tabs)/accounts" options={APP_SCREEN_OPTIONS} />
        <Stack.Screen name="(tabs)/add" options={APP_SCREEN_OPTIONS} />
        <Stack.Screen name="(tabs)/stats" options={APP_SCREEN_OPTIONS} />
        <Stack.Screen name="(tabs)/settings" options={APP_SCREEN_OPTIONS} />
        <Stack.Screen name="(settings)/personal-details" options={DETAIL_SCREEN_OPTIONS} />
        <Stack.Screen name="(settings)/preferences" options={DETAIL_SCREEN_OPTIONS} />
        <Stack.Screen name="(settings)/connected-accounts" options={DETAIL_SCREEN_OPTIONS} />
        <Stack.Screen name="(settings)/categories" options={DETAIL_SCREEN_OPTIONS} />
        <Stack.Screen name="(settings)/budgets" options={DETAIL_SCREEN_OPTIONS} />
        <Stack.Screen name="(settings)/ai-chat" options={DETAIL_SCREEN_OPTIONS} />
        <Stack.Screen name="(settings)/insights" options={DETAIL_SCREEN_OPTIONS} />
        <Stack.Screen name="(sheets)/transaction-compose" options={TRANSACTION_SHEET_OPTIONS} />
        <Stack.Screen name="(sheets)/account-compose" options={TRANSACTION_SHEET_OPTIONS} />
        <Stack.Screen name="(sheets)/account-picker" options={TRANSACTION_SHEET_OPTIONS} />
        <Stack.Screen name="(sheets)/category-compose" options={TRANSACTION_SHEET_OPTIONS} />
        <Stack.Screen name="(sheets)/category-picker" options={TRANSACTION_SHEET_OPTIONS} />
        <Stack.Screen name="(sheets)/plan-ahead" options={TRANSACTION_SHEET_OPTIONS} />
        <Stack.Screen name="(sheets)/budget-compose" options={TRANSACTION_SHEET_OPTIONS} />
      </Stack.Protected>

      {/* Screens outside the guards are accessible to everyone (e.g. not found) */}
    </Stack>
  );
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

const SIGN_UP_SCREEN_OPTIONS = {
  headerShown: false,
} as const;

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
};

const APP_SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'none',
} as const;

const DETAIL_SCREEN_OPTIONS = {
  title: '',
  headerShown: false,
};

const TRANSACTION_SHEET_OPTIONS = {
  presentation: 'transparentModal',
  title: '',
  headerShown: false,
  animation: 'slide_from_bottom',
  contentStyle: {
    backgroundColor: 'transparent',
  },
} as const;
