import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import {
  BudgetsSection,
  HomeBalanceHero,
  RecentTransactionsSection,
  SkeletonHeroCard,
  UpcomingSection,
} from '@/features/dashboard/components/home-sections';
import {
  getGreeting,
  getNextPlannedItem,
  getPlannedItemsForRestOfMonth,
  getProjectedBalanceAfterRecurring,
  getUpcomingTimingLabel,
} from '@/features/dashboard/lib/home-helpers';
import { useAccountsQuery } from '@/features/finance/hooks/use-accounts-query';
import { useBudgetsQuery } from '@/features/finance/hooks/use-budgets-query';
import { usePlannedItemsQuery } from '@/features/finance/hooks/use-planned-items-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { getNetWorth } from '@/features/finance/lib/selectors';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useUser();
  const accountsQuery = useAccountsQuery();
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true });
  const transactionsQuery = useTransactionsQuery();
  const budgetsQuery = useBudgetsQuery();

  const firstName = user?.firstName || 'there';
  const accounts = accountsQuery.data ?? [];
  const allPlannedItems = plannedItemsQuery.data ?? [];
  const monthScopedPlannedItems = useMemo(
    () => getPlannedItemsForRestOfMonth(allPlannedItems),
    [allPlannedItems]
  );
  const plannedItems = allPlannedItems.slice(0, 5);
  const allTransactions = transactionsQuery.data ?? [];
  const recentTransactions = allTransactions.slice(0, 5);
  const budgets = budgetsQuery.data ?? [];
  const incomePlannedItems = plannedItems.filter((item) => item.type === 'INCOME');
  const expensePlannedItems = plannedItems.filter((item) => item.type === 'EXPENSE');
  const totalBalance = getNetWorth(accounts);
  const leftAfterRecurring = getProjectedBalanceAfterRecurring(
    totalBalance,
    monthScopedPlannedItems
  );
  const nextBill = getNextPlannedItem(allPlannedItems, 'EXPENSE');
  const nextIncome = getNextPlannedItem(allPlannedItems, 'INCOME');

  const nextBillTiming = nextBill
    ? getUpcomingTimingLabel(nextBill.nextOccurrenceAt ?? nextBill.startDate)
    : 'No bill scheduled';
  const nextIncomeTiming = nextIncome
    ? getUpcomingTimingLabel(nextIncome.nextOccurrenceAt ?? nextIncome.startDate)
    : 'No income scheduled';

  const recentIncome = useMemo(
    () =>
      recentTransactions
        .filter((transaction) => transaction.type === 'INCOME' && transaction.source !== 'TRANSFER')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [recentTransactions]
  );

  const recentExpense = useMemo(
    () =>
      recentTransactions
        .filter((transaction) => transaction.type === 'EXPENSE' && transaction.source !== 'TRANSFER')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [recentTransactions]
  );

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
            title={`${getGreeting()}, ${firstName}!`}
            subtitle="Track balances, upcoming bills, and the categories shaping your month."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          {accountsQuery.isLoading ? (
            <SkeletonHeroCard />
          ) : (
            <HomeBalanceHero
              leftAfterRecurring={leftAfterRecurring}
              nextBillName={nextBill?.title ?? 'Nothing due'}
              nextBillTiming={nextBillTiming}
              nextIncomeName={nextIncome?.title ?? 'Nothing incoming'}
              nextIncomeTiming={nextIncomeTiming}
              onNewTransaction={() => router.push('/transaction-compose')}
              onOpenAccounts={() => router.replace('/accounts')}
            />
          )}

          <RecentTransactionsSection
            isLoading={transactionsQuery.isLoading}
            recentTransactions={recentTransactions}
            recentIncome={recentIncome}
            recentExpense={recentExpense}
            onOpenActivity={() => router.replace('/add')}
          />

          <UpcomingSection
            isLoading={plannedItemsQuery.isLoading}
            plannedItems={plannedItems}
            incomePlannedItems={incomePlannedItems}
            expensePlannedItems={expensePlannedItems}
            onPlanAhead={() => router.push('/plan-ahead')}
            onOpenRecurring={() => router.push('/recurring')}
          />

          <BudgetsSection
            isLoading={budgetsQuery.isLoading}
            budgets={budgets}
            transactions={allTransactions}
            onOpenBudgets={() => router.push('/budgets')}
          />
        </View>
      </ScrollView>

      <AppTabBar currentTab="home" />
    </View>
  );
}
