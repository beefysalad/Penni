import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { View } from 'react-native';

export default function VerifyEmailScreen() {
  return (
    <AuthScreenShell
      eyebrow="Confirm your email"
      title="Almost there"
      subtitle="Enter the code we sent to your inbox so we can secure your new account.">
      <View className="w-full">
        <VerifyEmailForm />
      </View>
    </AuthScreenShell>
  );
}
