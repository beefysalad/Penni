if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined');
}

export const env = {
  expoClerkPK: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
};
