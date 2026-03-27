import { RecurringScreen } from '@/features/finance/screens/recurring-screen';
import { Stack } from 'expo-router';

export default function RecurringRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RecurringScreen />
    </>
  );
}
