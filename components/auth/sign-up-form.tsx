import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useRef } from 'react';
import { TextInput, View } from 'react-native';
import { z } from 'zod';

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const { signUp, isLoaded } = useSignUp();
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onSubmit',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });
  const generalError = errors.root?.message;

  async function onSubmit(values: SignUpFormValues) {
    if (!isLoaded) return;

    try {
      await signUp.create({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        emailAddress: values.email.trim(),
        password: values.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      router.push(
        `/(auth)/sign-up/verify-email?email=${encodeURIComponent(values.email.trim())}`
      );
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message;
        const normalizedMessage = message.toLowerCase();

        if (normalizedMessage.includes('first name')) {
          setError('firstName', { type: 'server', message });
          return;
        }

        if (normalizedMessage.includes('last name')) {
          setError('lastName', { type: 'server', message });
          return;
        }

        if (
          normalizedMessage.includes('identifier') ||
          normalizedMessage.includes('email')
        ) {
          setError('email', { type: 'server', message });
          return;
        }

        if (normalizedMessage.includes('password')) {
          setError('password', { type: 'server', message });
          return;
        }

        setError('root', { type: 'server', message });
        return;
      }

      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onFirstNameSubmitEditing() {
    lastNameInputRef.current?.focus();
  }

  function onLastNameSubmitEditing() {
    emailInputRef.current?.focus();
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <View className="gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="pl-1 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#6d786f]">
              First name
            </Text>
            <View
              className={`rounded-[18px] border bg-[#0c1510] ${
                errors.firstName ? 'border-[#ff8a94]/50' : 'border-[#1a2820]'
              }`}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="firstName"
                    placeholder="John"
                    placeholderTextColor="#3d4e44"
                    autoCapitalize="words"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    returnKeyType="next"
                    onSubmitEditing={onFirstNameSubmitEditing}
                    className="h-14 border-0 bg-transparent px-4 text-white"
                  />
                )}
              />
            </View>
            {errors.firstName?.message ? (
              <Text className="text-xs font-medium text-[#ff8a94]">
                {errors.firstName.message}
              </Text>
            ) : null}
          </View>

          <View className="flex-1 gap-2">
            <Text className="pl-1 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#6d786f]">
              Last name
            </Text>
            <View
              className={`rounded-[18px] border bg-[#0c1510] ${
                errors.lastName ? 'border-[#ff8a94]/50' : 'border-[#1a2820]'
              }`}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={lastNameInputRef}
                    id="lastName"
                    placeholder="Doe"
                    placeholderTextColor="#3d4e44"
                    autoCapitalize="words"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    returnKeyType="next"
                    onSubmitEditing={onLastNameSubmitEditing}
                    className="h-14 border-0 bg-transparent px-4 text-white"
                  />
                )}
              />
            </View>
            {errors.lastName?.message ? (
              <Text className="text-xs font-medium text-[#ff8a94]">
                {errors.lastName.message}
              </Text>
            ) : null}
          </View>
        </View>

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
                  ref={emailInputRef}
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
          <Text className="pl-1 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#6d786f]">
            Password
          </Text>
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
                  placeholder="Choose a password"
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

        {generalError ? (
          <Text className="text-xs font-medium text-[#ff8a94]">
            {generalError}
          </Text>
        ) : null}

        <Button
          className="mt-1 h-14 rounded-[18px] bg-[#8bff62]"
          disabled={!isLoaded || isSubmitting}
          onPress={() => void handleSubmit(onSubmit)()}>
          <Text className="text-base font-bold text-[#07110a]">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Text>
        </Button>
      </View>

      <View className="gap-4">
        <Text className="text-center text-sm text-[#7a8c82]">
          Already have an account?{' '}
          <Link
            href="/(auth)/sign-in"
            dismissTo
            className="font-bold text-[#8bff62]">
            Sign in
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
