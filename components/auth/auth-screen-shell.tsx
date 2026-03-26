import { Text } from '@/components/ui/text';
import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { SvgUri } from 'react-native-svg';
import { ScrollView, View } from 'react-native';

type AuthScreenShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const penniSplashAsset = Asset.fromModule(require('@/assets/images/penni-splash.svg'));

export function AuthScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthScreenShellProps) {
  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerClassName="min-h-full px-6 pb-12 pt-safe pt-3">
        <View className="gap-8">
          <View className="overflow-hidden rounded-[38px] bg-[#08100c] px-2 pb-4 pt-6">
            <View className="absolute left-[-8%] top-8 size-40 rounded-full bg-[#173223]/75 blur-3xl" />
            <View className="absolute right-[-10%] top-16 size-44 rounded-full bg-[#8bff62]/12 blur-3xl" />
            <View className="absolute bottom-0 left-[18%] h-24 w-40 rounded-full bg-[#41d6b2]/10 blur-3xl" />

            <View className="items-center">
              <View className="h-[228px] w-full max-w-[340px] items-center justify-center">
                <SvgUri height="100%" width="100%" uri={penniSplashAsset.uri} />
              </View>

              <View className="mt-2 items-center px-4">
                <Text className="text-xs font-semibold uppercase tracking-[2.8px] text-[#8bff62]">
                  {eyebrow}
                </Text>
                <Text className="mt-3 text-center text-[34px] font-semibold leading-[40px] text-white">
                  {title}
                </Text>
                <Text className="mt-3 max-w-[320px] text-center text-[15px] leading-6 text-[#95a39c]">
                  {subtitle}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-1">
            {children}
          </View>

          <Text className="pb-2 text-center text-xs font-medium uppercase tracking-[3px] text-[#4d5c54]">
            Securely managing your finances
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
