import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CreditCardIcon, LandmarkIcon, ShieldCheckIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

const CONNECTIONS = [
  {
    title: 'Bank accounts',
    description: 'Link checking and savings accounts once you are ready for live balance sync.',
    icon: LandmarkIcon,
  },
  {
    title: 'Cards and wallets',
    description: 'Keep credit cards and digital wallets in one place for a fuller money picture.',
    icon: CreditCardIcon,
  },
  {
    title: 'Secure connection flow',
    description: 'When this is wired up for real, connections should happen through a secure provider.',
    icon: ShieldCheckIcon,
  },
] as const;

export default function ConnectedAccountsScreen() {
  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-safe pt-4">
        <Button
          variant="ghost"
          className="h-11 self-start rounded-full bg-[#111916] px-4"
          onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
        </Button>

        <View className="mt-6 rounded-[32px] border border-[#1b2a21] bg-[#0d1411] p-6">
          <Text className="text-[30px] font-semibold text-white">Connected accounts</Text>
          <Text className="mt-2 text-[15px] leading-6 text-[#95a39c]">
            This is the place for linking banks, cards, and other financial sources later on.
          </Text>
        </View>

        <View className="mt-6 gap-4">
          {CONNECTIONS.map((item) => (
            <View
              key={item.title}
              className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="size-12 items-center justify-center rounded-full bg-[#1a2c1f]">
                <item.icon color="#8bff62" size={20} />
              </View>
              <Text className="mt-4 text-lg font-semibold text-[#f4f7f5]">{item.title}</Text>
              <Text className="mt-2 text-sm leading-6 text-[#7f8c86]">{item.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
