import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { View } from 'react-native';

export default function SignUpScreen() {
  return (
    <AuthScreenShell
      eyebrow="Create your account"
      title="Build a calmer money routine"
      subtitle="Create your Penni account and start tracking what matters without the clutter.">
      <View className="w-full">
        <SignUpForm />
      </View>
    </AuthScreenShell>
  );
}
