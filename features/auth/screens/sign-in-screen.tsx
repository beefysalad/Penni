import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { SignInForm } from '@/components/auth/sign-in-form';
import { View } from 'react-native';

export default function SignInScreen() {
  return (
    <AuthScreenShell
      eyebrow="Penni"
      title="Know where your money goes"
      subtitle="Sign in to review balances, budgets, and upcoming bills in one calm place.">
      <View className="w-full">
        <SignInForm />
      </View>
    </AuthScreenShell>
  );
}
