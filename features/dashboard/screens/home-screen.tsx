import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { useAccountsQuery } from '@/features/finance/hooks/use-accounts-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowUpRightIcon, CalendarIcon, WalletCardsIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function HomeScreen() {
  const { user } = useUser();
  const firstName = user?.firstName || 'there';
  const accountsQuery = useAccountsQuery();
  const expenseCategoriesQuery = useCategoriesQuery({ type: 'EXPENSE' });

  const accounts = accountsQuery.data ?? [];
  const expenseCategories = expenseCategoriesQuery.data ?? [];
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const topAccount = accounts[0];
  const accountSummary = topAccount
    ? `${topAccount.name} is currently your main visible balance.`
    : 'Add your first account to start tracking balances.';
  const categorySummary =
    expenseCategories.length > 0
      ? `${expenseCategories.length} spending buckets are ready for expense logging.`
      : 'Default spending categories will appear here once category sync is ready.';

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
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
                  {formatCurrency(totalBalance)}
                </Text>
              </View>
              <View className="rounded-full bg-[#1a2c1f] px-3 py-2">
                <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#8bff62]">
                  Live
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row gap-3">
              <View className="flex-1 rounded-[24px] bg-[#18221d] p-4">
                <View className="size-10 items-center justify-center rounded-full bg-[#1f3325]">
                  <Icon as={WalletCardsIcon} className="size-5 text-[#8bff62]" />
                </View>
                <Text className="mt-4 text-xs font-semibold uppercase tracking-[1.8px] text-[#93a19a]">
                  Main account
                </Text>
                <Text className="mt-2 text-[17px] font-semibold leading-6 text-white">
                  {topAccount?.name ?? 'No account yet'}
                </Text>
                <Text className="mt-2 text-sm leading-5 text-[#93a19a]">{accountSummary}</Text>
              </View>
              <View className="flex-1 rounded-[24px] bg-[#141b1f] p-4">
                <View className="size-10 items-center justify-center rounded-full bg-[#1c2830]">
                  <Icon as={CalendarIcon} className="size-5 text-[#41d6b2]" />
                </View>
                <Text className="mt-4 text-xs font-semibold uppercase tracking-[1.8px] text-[#93a19a]">
                  Category setup
                </Text>
                <Text className="mt-2 text-[17px] font-semibold leading-6 text-white">
                  {expenseCategories.length > 0 ? 'Ready to log' : 'Not ready yet'}
                </Text>
                <Text className="mt-2 text-sm leading-5 text-[#93a19a]">{categorySummary}</Text>
              </View>
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="gap-4">
              <View>
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Upcoming</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  Planned items and recurring summaries will show here once that backend flow is wired.
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

            <View className="mt-5 rounded-[24px] bg-[#131b17] p-4">
              <Text className="text-sm leading-6 text-[#7f8c86]">
                No planned items yet. Use `Plan ahead` to add recurring bills or income.
              </Text>
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Budgets</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  Set monthly limits by category so Penni can flag drift once transaction tracking is live.
                </Text>
              </View>
              <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                <Icon as={ArrowUpRightIcon} className="size-5 text-[#8bff62]" />
              </View>
            </View>

            <View className="mt-5 flex-row items-center justify-between gap-3 rounded-[24px] bg-[#131b17] p-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#f4f7f5]">Budget management</Text>
                <Text className="mt-2 text-sm leading-6 text-[#7f8c86]">
                  Create budget categories first, then this card can evolve into real budget progress.
                </Text>
              </View>
              <View className="items-end gap-2">
                <Pill label="Soon" variant="subtle" />
                <Button
                  className="h-10 rounded-full bg-[#8bff62] px-4"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push('/budgets')}>
                  <Text className="text-sm font-semibold text-[#07110a]">Set budgets</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="home" />
    </View>
  );
}
