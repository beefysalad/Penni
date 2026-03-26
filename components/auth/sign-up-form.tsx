import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { useState, useRef } from 'react';

import { TextInput, View } from 'react-native';

export function SignUpForm() {
  const { signUp, isLoaded } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [error, setError] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  async function onSubmit() {
    if (!isLoaded) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !password) {
      setError({
        firstName: trimmedFirstName ? '' : 'First name is required.',
        lastName: trimmedLastName ? '' : 'Last name is required.',
        email: trimmedEmail ? '' : 'Email is required.',
        password: password ? '' : 'Password is required.',
      });
      return;
    }

    // Start sign-up process using email and password provided
    try {
      setError({});

      await signUp.create({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        emailAddress: trimmedEmail,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      router.push(`/(auth)/sign-up/verify-email?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const message = err.message;
        const normalizedMessage = message.toLowerCase();

        if (normalizedMessage.includes('first name')) {
          setError({ firstName: message });
          return;
        }

        if (normalizedMessage.includes('last name')) {
          setError({ lastName: message });
          return;
        }

        if (normalizedMessage.includes('identifier') || normalizedMessage.includes('email')) {
          setError({ email: message });
          return;
        }

        if (normalizedMessage.includes('password')) {
          setError({ password: message });
          return;
        }

        setError({ general: message });
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
      <View className="gap-5">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              First name
            </Text>
            <Input
              id="firstName"
              placeholder="John"
              placeholderTextColor="#6d786f"
              autoCapitalize="words"
              value={firstName}
              onChangeText={setFirstName}
              returnKeyType="next"
              onSubmitEditing={onFirstNameSubmitEditing}
              className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-white"
            />
            {error.firstName ? (
              <Text className="text-sm font-medium text-[#ff8a94]">{error.firstName}</Text>
            ) : null}
          </View>

          <View className="flex-1 gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              Last name
            </Text>
            <Input
              ref={lastNameInputRef}
              id="lastName"
              placeholder="Doe"
              placeholderTextColor="#6d786f"
              autoCapitalize="words"
              value={lastName}
              onChangeText={setLastName}
              returnKeyType="next"
              onSubmitEditing={onLastNameSubmitEditing}
              className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-white"
            />
            {error.lastName ? (
              <Text className="text-sm font-medium text-[#ff8a94]">{error.lastName}</Text>
            ) : null}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
            Email
          </Text>
          <Input
            ref={emailInputRef}
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
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
            Password
          </Text>
          <Input
            ref={passwordInputRef}
            id="password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            placeholder="Choose a password"
            placeholderTextColor="#6d786f"
            className="h-14 rounded-[20px] border-[#1d2a20] bg-[#111916] px-4 text-white"
          />
          {error.password ? (
            <Text className="text-sm font-medium text-[#ff8a94]">{error.password}</Text>
          ) : null}
        </View>

        {error.general ? (
          <Text className="text-sm font-medium text-[#ff8a94]">{error.general}</Text>
        ) : null}

        <Button className="h-14 rounded-[22px] bg-[#8bff62]" onPress={onSubmit}>
          <Text className="text-base font-semibold text-[#07110a]">Create account</Text>
        </Button>
      </View>

      <View className="gap-4">
        <Text className="text-center text-sm text-[#95a39c]">
          Already have an account?{' '}
          <Link href="/(auth)/sign-in" dismissTo className="font-semibold text-[#8bff62]">
            Sign in
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
