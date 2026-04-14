import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import * as React from 'react';
import { type TextInput, View } from 'react-native';
import { z } from 'zod';

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const passwordInputRef = React.useRef<TextInput>(null);
  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const email = watch('email');

  async function onSubmit(values: SignInFormValues) {
    if (!isLoaded) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: values.email.trim(),
        password: values.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }

      if (
        signInAttempt.status === 'needs_second_factor' ||
        (signInAttempt as any)._status === 'needs_client_trust'
      ) {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
          });
          router.push({
            pathname: '/(auth)/verify-sign-in',
            params: { email: values.email.trim() },
          });
          return;
        }
      }

      console.error(JSON.stringify(signInAttempt, null, 2));
    } catch (err) {
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');

        setError(isEmailMessage ? 'email' : 'password', {
          type: 'server',
          message: err.message,
        });
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
      <View className="gap-4">
        <View className="gap-2">
          <Text className="pl-1 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#6d786f]">
            Email
          </Text>
          <View
            className={`rounded-[18px] border bg-[#0c1510] ${
              errors.email ? 'border-[#ff8a94]/50' : 'border-[#1a2820]'
            }`}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="email"
                  placeholder="name@email.com"
                  placeholderTextColor="#3d4e44"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={onEmailSubmitEditing}
                  returnKeyType="next"
                  className="h-14 border-0 bg-transparent px-4 text-white"
                />
              )}
            />
          </View>
          {errors.email?.message ? (
            <Text className="text-xs font-medium text-[#ff8a94]">
              {errors.email.message}
            </Text>
          ) : null}
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="pl-1 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#6d786f]">
              Password
            </Text>
            <Link href={`/(auth)/forgot-password?email=${email}`} asChild>
              <Button variant="ghost" className="h-auto px-0 py-0">
                <Text className="text-xs font-semibold text-[#8bff62]">
                  Forgot password?
                </Text>
              </Button>
            </Link>
          </View>
          <View
            className={`rounded-[18px] border bg-[#0c1510] ${
              errors.password ? 'border-[#ff8a94]/50' : 'border-[#1a2820]'
            }`}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={passwordInputRef}
                  id="password"
                  secureTextEntry
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSubmit(onSubmit)()}
                  placeholder="Enter your password"
                  placeholderTextColor="#3d4e44"
                  className="h-14 border-0 bg-transparent px-4 text-white"
                />
              )}
            />
          </View>
          {errors.password?.message ? (
            <Text className="text-xs font-medium text-[#ff8a94]">
              {errors.password.message}
            </Text>
          ) : null}
        </View>

        <Button
          className="mt-1 h-14 rounded-[18px] bg-[#8bff62]"
          disabled={!isLoaded || isSubmitting}
          onPress={() => void handleSubmit(onSubmit)()}>
          <Text className="text-base font-bold text-[#07110a]">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Text>
        </Button>
      </View>

      <View className="gap-4">
        <Text className="text-center text-sm text-[#7a8c82]">
          Don&apos;t have an account?{' '}
          <Link href="/(auth)/sign-up" className="font-bold text-[#8bff62]">
            Create one
          </Link>
        </Text>

        <View className="flex-row items-center gap-3">
          <Separator className="flex-1 bg-[#1a2820]" />
          <Text className="text-xs text-[#4a5c52]">or continue with</Text>
          <Separator className="flex-1 bg-[#1a2820]" />
        </View>

        <SocialConnections />
      </View>
    </View>
  );
}
