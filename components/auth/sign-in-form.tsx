import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { type TextInput, View } from 'react-native';

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  async function onSubmit() {
    if (!isLoaded) {
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        setError({ email: '', password: '' });
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }

      if (
        signInAttempt.status === 'needs_second_factor' ||
        (signInAttempt as any)._status === 'needs_client_trust'
      ) {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (f) => f.strategy === 'email_code'
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
          });
          router.push({
            pathname: '/(auth)/verify-sign-in',
            params: { email },
          });
          return;
        }
      }

      // TODO: Handle other statuses
      console.error(JSON.stringify(signInAttempt, null, 2));
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
            Email
          </Text>
          <Input
            id="email"
            placeholder="name@email.com"
            placeholderTextColor="#6d786f"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={onEmailSubmitEditing}
            returnKeyType="next"
            className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-white"
          />
          {error.email ? (
            <Text className="text-sm font-medium text-[#ff8a94]">{error.email}</Text>
          ) : null}
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              Password
            </Text>
            <Link href={`/(auth)/forgot-password?email=${email}`} asChild>
              <Button variant="ghost" className="h-auto px-0 py-0">
                <Text className="text-sm font-medium text-[#8bff62]">Forgot password?</Text>
              </Button>
            </Link>
          </View>
          <Input
            ref={passwordInputRef}
            id="password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            placeholder="Enter your password"
            placeholderTextColor="#6d786f"
            className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-white"
          />
          {error.password ? (
            <Text className="text-sm font-medium text-[#ff8a94]">{error.password}</Text>
          ) : null}
        </View>

        <Button className="h-14 rounded-[22px] bg-[#8bff62]" onPress={onSubmit}>
          <Text className="text-base font-semibold text-[#07110a]">Continue</Text>
        </Button>
      </View>

      <View className="gap-4">
        <Text className="text-center text-sm text-[#95a39c]">
          Don&apos;t have an account?{' '}
          <Link href="/(auth)/sign-up" className="font-semibold text-[#8bff62]">
            Create one
          </Link>
        </Text>

        <View className="flex-row items-center">
          <Separator className="flex-1 bg-[#1d2a20]" />
          <Text className="px-4 text-sm text-[#6d786f]">or continue with</Text>
          <Separator className="flex-1 bg-[#1d2a20]" />
        </View>

        <SocialConnections />
      </View>
    </View>
  );
}
