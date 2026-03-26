import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { budgets, upcomingTransactions, weeklyBars } from '@/features/finance/lib/mock-finance';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowDownIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  SparklesIcon,
  WalletCardsIcon,
} from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useUser();
  const firstName = user?.firstName || 'there';

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-44"
        showsVerticalScrollIndicator={false}>
        <View className="pt-safe rounded-b-[36px] bg-[#0b120e] px-6 pb-6 pt-4">
          <AppPageHeader
            eyebrow="Penni overview"
            title={`Hello, ${firstName}!`}
            subtitle="Track balances, upcoming bills, and the categories shaping your month."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-white/65">Total balance</Text>
                <Text className="mt-2 text-[34px] font-semibold tracking-[-1px] text-white">
                  ₱19,920
                </Text>
              </View>
              <View className="rounded-full bg-[#1a2c1f] px-3 py-2">
                <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#8bff62]">
                  March
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row gap-3">
              <View className="flex-1 rounded-[24px] bg-[#18221d] p-4">
                <View className="size-10 items-center justify-center rounded-full bg-[#1f3325]">
                  <Icon as={ArrowUpRightIcon} className="size-5 text-[#8bff62]" />
                </View>
                <Text className="mt-4 text-sm text-[#93a19a]">Saved this month</Text>
                <Text className="mt-1 text-xl font-semibold text-white">₱8,450</Text>
              </View>
              <View className="flex-1 rounded-[24px] bg-[#141b1f] p-4">
                <View className="size-10 items-center justify-center rounded-full bg-[#1c2830]">
                  <Icon as={CalendarIcon} className="size-5 text-[#41d6b2]" />
                </View>
                <Text className="mt-4 text-sm text-[#93a19a]">Next payday</Text>
                <Text className="mt-1 text-xl font-semibold text-white">12 days</Text>
              </View>
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="gap-4">
              <View>
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Upcoming</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  Recurring income and bills that need your attention soon.
                </Text>
              </View>
              <Button
                className="h-12 self-start rounded-full bg-[#8bff62] px-5"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/plan-ahead')}>
                <Text className="text-sm font-semibold text-[#07110a]">Plan ahead</Text>
              </Button>
            </View>

            <View className="mt-5 gap-3">
              {upcomingTransactions.map((transaction) => (
                <View
                  key={transaction.title}
                  className={`flex-row items-center gap-4 rounded-[24px] px-4 py-4 ${transaction.toneClassName}`}>
                  <View
                    className={`size-12 items-center justify-center rounded-full ${transaction.iconClassName}`}>
                    <Icon as={ArrowDownIcon} className="size-5 text-[#f4f7f5]" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-[#f4f7f5]">
                      {transaction.title}
                    </Text>
                    <Text className="mt-1 text-sm text-[#7f8c86]">{transaction.date}</Text>
                  </View>
                  <Text className={`text-base font-semibold ${transaction.amountClassName}`}>
                    {transaction.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Budgets</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  Keep an eye on the categories that move your balance the most.
                </Text>
              </View>
              <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                <Icon as={WalletCardsIcon} className="size-5 text-[#8bff62]" />
              </View>
            </View>

            <View className="mt-5 gap-4">
              {budgets.map((budget) => (
                <View key={budget.name} className="gap-2">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="text-base font-semibold text-[#f4f7f5]">{budget.name}</Text>
                    <Text className="text-sm text-[#7f8c86]">
                      {budget.used} / {budget.total}
                    </Text>
                  </View>
                  <View
                    className="h-3 overflow-hidden rounded-full"
                    style={{ backgroundColor: budget.trackColor }}>
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${budget.progress * 100}%`,
                        backgroundColor: budget.fillColor,
                      }}
                    />
                  </View>
                  <Text className="text-sm text-[#7f8c86]">{budget.left}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="size-11 items-center justify-center rounded-full bg-[#18221d]">
                <Icon as={SparklesIcon} className="size-5 text-[#8bff62]" />
              </View>
              <Text className="mt-4 text-sm font-medium text-[#7f8c86]">Net flow</Text>
              <Text className="mt-1 text-[28px] font-semibold text-[#f4f7f5]">₱16,847</Text>
              <Text className="mt-2 text-sm leading-5 text-[#7f8c86]">
                You're trending better than last month.
              </Text>
            </View>

            <View className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="text-sm font-medium text-[#7f8c86]">Last 7 days</Text>
              <Text className="mt-1 text-[28px] font-semibold text-[#f4f7f5]">₱4,269</Text>
              <View className="mt-5 flex-row items-end justify-between gap-2">
                {weeklyBars.map((barClassName, index) => (
                  <View key={`${barClassName.color}-${index}`} className="flex-1 items-center gap-2">
                    <View
                      className="w-full rounded-full"
                      style={{
                        height: barClassName.height,
                        backgroundColor: barClassName.color,
                      }}
                    />
                    <Text className="text-[10px] font-semibold uppercase text-[#6d786f]">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="home" />
    </View>
  );
}
