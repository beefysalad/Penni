import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { View } from 'react-native';

export default function ResetPasswordScreen() {
  return (
    <AuthScreenShell
      eyebrow="Create a new password"
      title="Set a stronger login"
      subtitle="Enter your code and choose a password you’ll remember but others won’t guess.">
      <View className="w-full">
        <ResetPasswordForm />
      </View>
    </AuthScreenShell>
  );
}
