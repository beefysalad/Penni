import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

const RESEND_CODE_INTERVAL_SECONDS = 30;

export function VerifySignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [countdown, setCountdown] = React.useState(RESEND_CODE_INTERVAL_SECONDS);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const restartCountdown = React.useCallback(() => {
    setCountdown(RESEND_CODE_INTERVAL_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  React.useEffect(() => {
    restartCountdown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [restartCountdown]);

  async function onSubmit() {
    if (!isLoaded) return;

    try {
      setError('');

      // Attempt to verify the second factor (email code)
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      // If verification was completed, set the session to active
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }

      console.error(JSON.stringify(signInAttempt, null, 2));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function onResendCode() {
    if (!isLoaded) return;

    try {
      await signIn.prepareSecondFactor({ strategy: 'email_code' });
      restartCountdown();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <View className="gap-6">
      <Text className="text-sm leading-6 text-[#95a39c]">
        Enter the code sent to <Text className="font-semibold text-white">{email || 'your email'}</Text>{' '}
        to complete sign in.
      </Text>

      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
            Verification code
          </Text>
          <Input
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
          {!error ? null : <Text className="text-sm font-medium text-[#ff8a94]">{error}</Text>}
        </View>

        <Button className="h-14 rounded-[22px] bg-[#8bff62]" onPress={onSubmit}>
          <Text className="text-base font-semibold text-[#07110a]">Continue</Text>
        </Button>

        <Button
          variant="ghost"
          className="h-auto self-start px-0 py-0"
          disabled={countdown > 0}
          onPress={onResendCode}>
          <Text className="text-sm font-medium text-[#8bff62]">
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </Text>
        </Button>

        <Button variant="ghost" className="h-auto self-start px-0 py-0" onPress={router.back}>
          <Text className="text-sm font-medium text-[#95a39c]">Back</Text>
        </Button>
      </View>
    </View>
  );
}
