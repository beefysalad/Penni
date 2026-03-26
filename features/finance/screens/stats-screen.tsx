import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIcon,
  ChartColumnBigIcon,
  CircleDollarSignIcon,
  TargetIcon,
} from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

const STAT_TILES = [
  {
    label: 'Spend pace',
    value: 'Waiting on transaction flow',
    icon: ActivityIcon,
    color: '#8bff62',
  },
  {
    label: 'Top category',
    value: 'Will appear after real entries',
    icon: ChartColumnBigIcon,
    color: '#5aa9ff',
  },
  {
    label: 'Net cash flow',
    value: 'Tracks income vs spending',
    icon: CircleDollarSignIcon,
    color: '#41d6b2',
  },
  {
    label: 'Budget drift',
    value: 'Highlights categories slipping',
    icon: TargetIcon,
    color: '#ffc857',
  },
] as const;

export default function StatsScreen() {
  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Monthly trends"
            title="Statistics"
            subtitle="See how your money is moving with quick summaries and category breakdowns."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="gap-4">
            <View className="flex-row gap-4">
              {STAT_TILES.slice(0, 2).map((tile, index) => (
                <View key={tile.label} className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
                  <View className="size-11 items-center justify-center rounded-full bg-[#131b17]">
                    <Icon as={tile.icon} className="size-5" color={tile.color} />
                  </View>
                  <Text className="mt-4 text-xs font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                    {tile.label}
                  </Text>
                  <Text className="mt-3 text-[17px] font-semibold leading-6 text-[#f4f7f5]">
                    {tile.value}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-4">
              {STAT_TILES.slice(2).map((tile) => (
                <View key={tile.label} className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
                  <View className="size-11 items-center justify-center rounded-full bg-[#131b17]">
                    <Icon as={tile.icon} className="size-5" color={tile.color} />
                  </View>
                  <Text className="mt-4 text-xs font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                    {tile.label}
                  </Text>
                  <Text className="mt-3 text-[17px] font-semibold leading-6 text-[#f4f7f5]">
                    {tile.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-[28px] font-semibold text-[#f4f7f5]">Expense distribution</Text>
            <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
              This section will come alive once real transaction totals are available.
            </Text>

            <View className="mt-6 rounded-[24px] bg-[#121916] p-4">
              <Text className="text-sm leading-6 text-[#7f8c86]">
                The direction here is real analytics: monthly spend, strongest category, cash flow, and where your budget starts drifting. We just need transaction data to drive it.
              </Text>
            </View>
          </View>

          <View className="rounded-[30px] border border-[#203326] bg-[#101913] p-6">
            <Text className="max-w-[260px] text-[30px] font-semibold leading-[36px] text-[#f4f7f5]">
              Stay on budget with smart insights
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-[#95a39c]">
              Penni turns your spending into clean trends so you can catch category drift before it becomes a problem.
            </Text>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="stats" />
    </View>
  );
}
