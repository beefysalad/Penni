import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import * as React from 'react';
import { View } from 'react-native';

export function ForgotPasswordForm() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = React.useState(emailParam);
  const { signIn, isLoaded } = useSignIn();
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  const onSubmit = async () => {
    if (!email) {
      setError({ email: 'Email is required' });
      return;
    }
    if (!isLoaded) {
      return;
    }

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      router.push(`/(auth)/reset-password?email=${email}`);
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError({ email: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
          Email
        </Text>
        <Input
          id="email"
          value={email}
          placeholder="name@email.com"
          placeholderTextColor="#6d786f"
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          onChangeText={setEmail}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
          className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-white"
        />
        {error.email ? <Text className="text-sm font-medium text-[#ff8a94]">{error.email}</Text> : null}
      </View>

      <Button className="h-14 rounded-[22px] bg-[#8bff62]" onPress={onSubmit}>
        <Text className="text-base font-semibold text-[#07110a]">Send reset code</Text>
      </Button>

      <Button variant="ghost" className="h-auto self-start px-0 py-0" onPress={router.back}>
        <Text className="text-sm font-medium text-[#95a39c]">Back to sign in</Text>
      </Button>
    </View>
  );
}
