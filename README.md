# Penni Mobile

Penni Mobile is the Expo + React Native client for Penni. It uses Clerk for authentication, Nativewind for styling, and Expo Router for navigation.

## Stack

- Expo
- React Native
- Expo Router
- Clerk
- Nativewind
- Axios

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

If `.env.example` does not exist yet, create `.env` manually.

3. Add the required environment variables:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start the Expo dev server:

```bash
npm run dev
```

## Device Notes

If you are testing on a real phone, `localhost` will not reach your backend running on your laptop.

Use either:

- your machine's LAN IP, for example `http://192.168.x.x:3000/api`
- or a public tunnel URL for the backend

Expo `--tunnel` only exposes the Expo bundler. It does not expose the backend API by itself.

## Scripts

```bash
npm run dev
npm run ios
npm run android
npm run web
```

## Project Structure

The app uses Expo Router, but the route files are intentionally thin. `app/` is for routing, while the actual screen implementations live under `features/`.

```text
app/
  (auth)/
  (settings)/
  (sheets)/
  (tabs)/
  _layout.tsx

components/
  auth/
  forms/
  navigation/
  sheets/
  ui/

features/
  auth/
    lib/
    screens/
  dashboard/
    screens/
  finance/
    lib/
    screens/
  planning/
    screens/
  settings/
    screens/

lib/
  api.ts
  env.ts
  theme.ts
  utils.ts
```

## Routing Pattern

Route files inside `app/` should stay very small.

Example:

```tsx
import AccountsScreen from '@/features/finance/screens/accounts-screen';

export default function AccountsRoute() {
  return <AccountsScreen />;
}
```

This keeps routing concerns in `app/` and screen logic in `features/`.

## Main Route Groups

- `(auth)`: sign-in, sign-up, password reset, verification
- `(tabs)`: main signed-in screens
- `(sheets)`: modal / bottom-sheet style routes
- `(settings)`: deeper account/settings detail screens

Parentheses in Expo Router mean route groups. They organize the files without adding the group name to the route path.

## Auth Flow

Penni uses Clerk as the source of truth for auth.

High-level flow:

1. User signs in with Clerk
2. Mobile app gets a Clerk session token
3. Mobile app calls the backend `/api/me`
4. Backend verifies the Clerk token and syncs/upserts the local user

Relevant files:

- [app/_layout.tsx](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/app/_layout.tsx)
- [backend-user.tsx](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/features/auth/lib/backend-user.tsx)
- [backend-user.api.ts](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/features/auth/lib/backend-user.api.ts)
- [api.ts](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/lib/api.ts)

## Current UI Organization

- Reusable auth UI lives in [components/auth](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/components/auth)
- Shared navigation UI lives in [components/navigation](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/components/navigation)
- Shared form helpers live in [components/forms](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/components/forms)
- Shared sheet helpers live in [components/sheets](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/components/sheets)
- Low-level design system pieces live in [components/ui](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/components/ui)

## Notes

- `.env` should not be tracked by git. If it shows up in git, it was previously added and needs to be removed from the index with `git rm --cached .env`.
- Some screens currently use mock finance data from [mock-finance.ts](/Users/jpatrickzxc/Documents/coding/Penni/penni-mobile/features/finance/lib/mock-finance.ts) while backend-backed finance flows are still being built.

## Verification

To verify TypeScript after changes:

```bash
npx tsc --noEmit -p tsconfig.json
```
