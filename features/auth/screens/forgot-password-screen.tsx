import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { View } from 'react-native';

export default function ForgotPasswordScreen() {
  return (
    <AuthScreenShell
      eyebrow="Recover access"
      title="Reset your password"
      subtitle="We’ll send a verification code so you can get back into your account quickly.">
      <View className="w-full">
        <ForgotPasswordForm />
      </View>
    </AuthScreenShell>
  );
}
