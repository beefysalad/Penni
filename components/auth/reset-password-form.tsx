import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { TextInput, View } from 'react-native';

export function ResetPasswordForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const codeInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState({ code: '', password: '' });

  async function onSubmit() {
    if (!isLoaded) {
      return;
    }
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        // Set the active session to
        // the newly created session (user is now signed in)
        setActive({ session: result.createdSessionId });
        return;
      }
      // TODO: Handle other statuses
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isPasswordMessage = err.message.toLowerCase().includes('password');
        setError({ code: '', password: isPasswordMessage ? err.message : '' });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
            New password
          </Text>
          <Input
            id="password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="next"
            onSubmitEditing={onPasswordSubmitEditing}
            placeholder="Choose a new password"
            placeholderTextColor="#6d786f"
            className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-white"
          />
          {error.password ? (
            <Text className="text-sm font-medium text-[#ff8a94]">{error.password}</Text>
          ) : null}
        </View>

        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
            Verification code
          </Text>
          <Input
            ref={codeInputRef}
            id="code"
            value={code}
            autoCapitalize="none"
            onChangeText={setCode}
            returnKeyType="done"
            keyboardType="number-pad"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            onSubmitEditing={onSubmit}
            placeholder="123456"
            placeholderTextColor="#6d786f"
            className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-center text-lg font-semibold tracking-[6px] text-white"
          />
          {error.code ? (
            <Text className="text-sm font-medium text-[#ff8a94]">{error.code}</Text>
          ) : null}
        </View>

        <Button className="h-14 rounded-[22px] bg-[#8bff62]" onPress={onSubmit}>
          <Text className="text-base font-semibold text-[#07110a]">Reset password</Text>
        </Button>

        <Button variant="ghost" className="h-auto self-start px-0 py-0" onPress={router.back}>
          <Text className="text-sm font-medium text-[#95a39c]">Back</Text>
        </Button>
      </View>
    </View>
  );
}
