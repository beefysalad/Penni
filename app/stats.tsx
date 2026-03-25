import { AppPageHeader } from '@/components/app-page-header';
import { AppTabBar } from '@/components/app-tab-bar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { categoryStats, statCards } from '@/lib/mock-finance';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartColumnBigIcon,
  ReceiptTextIcon,
} from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

const STAT_ICONS = [ArrowDownIcon, ArrowUpIcon, ChartColumnBigIcon, ReceiptTextIcon] as const;

export default function StatsScreen() {
  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-36"
        showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Monthly trends"
            title="Statistics"
            subtitle="See how your money is moving with quick summaries and category breakdowns."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="flex-row flex-wrap gap-4">
            {statCards.map((card, index) => (
              <View
                key={card.label}
                className="w-[48%] rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
                <View className={`size-11 items-center justify-center rounded-full ${card.iconWrapClassName}`}>
                  <Icon as={STAT_ICONS[index]} className="size-5 text-[#8bff62]" />
                </View>
                <Text className="mt-4 text-sm font-medium uppercase tracking-[1.6px] text-[#6d786f]">
                  {card.label}
                </Text>
                <Text className={`mt-2 text-[30px] font-semibold ${card.valueClassName}`}>
                  {card.value}
                </Text>
              </View>
            ))}
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-[28px] font-semibold text-[#f4f7f5]">Expense distribution</Text>
            <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
              Your spending splits across categories and gives you quick signals on drift.
            </Text>

            <View className="mt-6 flex-row gap-4">
              <View className="items-center justify-center">
                <View className="size-36 items-center justify-center rounded-full border-[14px] border-[#8bff62] bg-[#121916]">
                  <View className="size-24 items-center justify-center rounded-full bg-[#0b120e]">
                    <Text className="text-[30px] font-semibold text-[#f4f7f5]">42%</Text>
                    <Text className="mt-1 text-sm text-[#7f8c86]">Food</Text>
                  </View>
                </View>
              </View>

              <View className="flex-1 gap-4">
                {categoryStats.map((item) => (
                  <View key={item.name} className="gap-2">
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-row items-center gap-2">
                        <View className={`size-3 rounded-full ${item.dotClassName}`} />
                        <Text className="text-sm font-semibold text-[#f4f7f5]">{item.name}</Text>
                      </View>
                      <Text className="text-sm text-[#7f8c86]">{item.amount}</Text>
                    </View>
                    <View className={`h-3 overflow-hidden rounded-full ${item.trackClassName}`}>
                      <View className={`h-full rounded-full ${item.fillClassName}`} />
                    </View>
                    <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                      {item.percent} of expenses
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="rounded-[30px] border border-[#203326] bg-[#101913] p-6">
            <Text className="text-[30px] font-semibold leading-[36px] text-[#f4f7f5]">
              Stay on budget with smart insights
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-[#95a39c]">
              Penni turns your spending into clean trends so you can catch category drift before it
              becomes a problem.
            </Text>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="stats" />
    </View>
  );
}
