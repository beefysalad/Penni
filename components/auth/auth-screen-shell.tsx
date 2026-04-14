import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Image, ScrollView, View } from 'react-native';

type AuthScreenShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreenShell({ eyebrow, title, subtitle, children }: AuthScreenShellProps) {
  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerClassName="min-h-full px-6 pb-12 pt-safe pt-12">
        <View className="gap-10">
          <View className="items-center gap-7">
            <View className="bg-[#8bff62]/7 absolute left-[-30%] top-[-5%] size-72 rounded-full blur-3xl" />
            <View className="bg-[#41d6b2]/8 absolute right-[-25%] top-[20%] size-60 rounded-full blur-3xl" />
            <View className="absolute left-[10%] top-[50%] size-48 rounded-full bg-[#173223]/60 blur-3xl" />

            <View className="items-center gap-4">
              <Image
                source={require('@/assets/images/penni-logo.webp')}
                className="size-[84px] rounded-full"
                resizeMode="contain"
              />
              <Text className="text-[22px] font-bold tracking-[6px] text-white">PENNI</Text>
            </View>
          </View>

          <View className="w-full gap-6">{children}</View>

          <View className="items-center gap-2">
            <View className="h-px w-8 rounded-full bg-[#1d2a20]" />
            <Text className="text-[10px] font-medium uppercase tracking-[3px] text-[#3a4840]">
              Secured with end-to-end encryption
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
