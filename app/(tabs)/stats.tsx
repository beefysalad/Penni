import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { categoryStats, statCards } from '@/features/finance/lib/mock-finance';
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
        contentContainerClassName="pb-44"
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
          <View className="gap-4">
            <View className="flex-row gap-4">
              {statCards.slice(0, 2).map((card, index) => (
                <View
                  key={card.label}
                  className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
                  <View
                    className={`size-11 items-center justify-center rounded-full ${card.iconWrapClassName}`}>
                    <Icon as={STAT_ICONS[index]} className="size-5" color={card.iconColor} />
                  </View>
                  <Text className="mt-4 text-xs font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                    {card.label}
                  </Text>
                  <Text className={`mt-2 text-[24px] font-semibold leading-[30px] ${card.valueClassName}`}>
                    {card.value}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-4">
              {statCards.slice(2).map((card, index) => (
                <View
                  key={card.label}
                  className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
                  <View
                    className={`size-11 items-center justify-center rounded-full ${card.iconWrapClassName}`}>
                    <Icon as={STAT_ICONS[index + 2]} className="size-5" color={card.iconColor} />
                  </View>
                  <Text className="mt-4 text-xs font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                    {card.label}
                  </Text>
                  <Text className={`mt-2 text-[24px] font-semibold leading-[30px] ${card.valueClassName}`}>
                    {card.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-[28px] font-semibold text-[#f4f7f5]">Expense distribution</Text>
            <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
              Your spending splits across categories and gives you quick signals on drift.
            </Text>

            <View className="mt-6 items-center">
              <View className="size-40 items-center justify-center rounded-full border-[16px] border-[#8bff62] bg-[#121916]">
                <View className="size-27 items-center justify-center rounded-full bg-[#0b120e]">
                  <Text className="text-[34px] font-semibold text-[#f4f7f5]">42%</Text>
                  <Text className="mt-1 text-sm font-medium text-[#7f8c86]">Food</Text>
                </View>
              </View>
            </View>

            <View className="mt-6 rounded-[24px] bg-[#121916] px-4">
              {categoryStats.map((item, index) => (
                <View
                  key={item.name}
                  className={`flex-row items-center justify-between gap-4 py-4 ${
                    index < categoryStats.length - 1 ? 'border-b border-[#1a241d]' : ''
                  }`}>
                  <View className="flex-row items-center gap-3">
                    <View
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.dotColor }}
                    />
                    <Text className="text-[15px] font-semibold text-[#f4f7f5]">{item.name}</Text>
                  </View>
                  <Text className="text-[15px] font-semibold text-[#7f8c86]">{item.percent}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[30px] border border-[#203326] bg-[#101913] p-6">
            <Text className="max-w-[260px] text-[30px] font-semibold leading-[36px] text-[#f4f7f5]">
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
