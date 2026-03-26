import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { VerifySignInForm } from '@/components/auth/verify-sign-in-form';
import { View } from 'react-native';

export default function VerifySignInScreen() {
  return (
    <AuthScreenShell
      eyebrow="Extra protection"
      title="Verify your sign in"
      subtitle="Use the code we just sent to your email to finish signing in safely.">
      <View className="w-full">
        <VerifySignInForm />
      </View>
    </AuthScreenShell>
  );
}
