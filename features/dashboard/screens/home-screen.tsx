import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Badge } from '@/components/ui/pill';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { useAccountsQuery } from '@/features/finance/hooks/use-accounts-query';
import { useBudgetsQuery } from '@/features/finance/hooks/use-budgets-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { usePlannedItemsQuery } from '@/features/finance/hooks/use-planned-items-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import type { Budget } from '@/features/finance/lib/finance.types';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  PlusIcon,
  ReceiptTextIcon,
  SparklesIcon,
  TargetIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletCardsIcon,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getDaysUntil(value: string) {
  const today = new Date();
  const target = new Date(value);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getSpentForBudget(
  budget: Budget,
  transactions: { amount: string; currency: string; categoryId: string | null; transactionAt: string; type: string }[],
) {
  const start = new Date(budget.periodStart);
  const end = new Date(budget.periodEnd);

  return transactions
    .filter((t) => {
      if (t.type !== 'EXPENSE') return false;
      if (budget.categoryId && t.categoryId !== budget.categoryId) return false;
      const txDate = new Date(t.transactionAt);
      return txDate >= start && txDate <= end;
    })
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
}

// ─── Skeleton cards ───────────────────────────────────────────────────────────

function SkeletonHeroCard() {
  return (
    <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
      <View className="h-4 w-20 rounded-full bg-[#1a2620]" />
      <View className="mt-3 h-10 w-40 rounded-full bg-[#1a2620]" />
      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-[20px] bg-[#18221d] p-4">
          <View className="h-3 w-16 rounded-full bg-[#1f3325]" />
          <View className="mt-3 h-6 w-28 rounded-full bg-[#1f3325]" />
        </View>
        <View className="flex-1 rounded-[20px] bg-[#18221d] p-4">
          <View className="h-3 w-16 rounded-full bg-[#1f3325]" />
          <View className="mt-3 h-6 w-28 rounded-full bg-[#1f3325]" />
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useUser();
  const firstName = user?.firstName || 'there';
  const accountsQuery = useAccountsQuery();
  const expenseCategoriesQuery = useCategoriesQuery({ type: 'EXPENSE' });
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true });
  const transactionsQuery = useTransactionsQuery();
  const budgetsQuery = useBudgetsQuery();

  const accounts = accountsQuery.data ?? [];
  const expenseCategories = expenseCategoriesQuery.data ?? [];
  const plannedItems = (plannedItemsQuery.data ?? []).slice(0, 5);
  const allTransactions = transactionsQuery.data ?? [];
  const recentTransactions = allTransactions.slice(0, 5);
  const budgets = budgetsQuery.data ?? [];
  const incomePlannedItems = plannedItems.filter((item) => item.type === 'INCOME');
  const expensePlannedItems = plannedItems.filter((item) => item.type === 'EXPENSE');
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  // Recent transaction stats
  const recentIncome = useMemo(
    () =>
      recentTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [recentTransactions],
  );
  const recentExpense = useMemo(
    () =>
      recentTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [recentTransactions],
  );

  const topAccount = accounts[0];

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <View className="pt-safe rounded-b-[36px] bg-[#0b120e] px-6 pb-6 pt-4">
          <AppPageHeader
            eyebrow="Penni overview"
            title={`${getGreeting()}, ${firstName}!`}
            subtitle="Track balances, upcoming bills, and the categories shaping your month."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          {/* ─── Balance hero card ─────────────────────────────────────────── */}
          {accountsQuery.isLoading ? (
            <SkeletonHeroCard />
          ) : (
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

              {/* Quick summary tiles */}
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
                  {topAccount ? (
                    <Text className="mt-1 text-sm text-[#93a19a]">
                      {formatCurrency(Number(topAccount.balance), topAccount.currency)}
                    </Text>
                  ) : (
                    <Text className="mt-1 text-sm leading-5 text-[#93a19a]">
                      Add your first account to start tracking.
                    </Text>
                  )}
                </View>
                <View className="flex-1 rounded-[24px] bg-[#141b1f] p-4">
                  <View className="size-10 items-center justify-center rounded-full bg-[#1c2830]">
                    <Icon as={CalendarIcon} className="size-5 text-[#41d6b2]" />
                  </View>
                  <Text className="mt-4 text-xs font-semibold uppercase tracking-[1.8px] text-[#93a19a]">
                    Categories
                  </Text>
                  <Text className="mt-2 text-[17px] font-semibold leading-6 text-white">
                    {expenseCategories.length > 0
                      ? `${expenseCategories.length} ready`
                      : 'Not set up'}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-[#93a19a]">
                    {expenseCategories.length > 0
                      ? 'Spending buckets are ready for logging.'
                      : 'Default categories will appear once synced.'}
                  </Text>
                </View>
              </View>

              {/* Quick actions */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pt-4">
                <Pressable
                  className="flex-row items-center gap-1.5 rounded-full bg-[#1d1518] px-3.5 py-2"
                  onPress={() => router.push('/transaction-compose?type=EXPENSE')}>
                  <ArrowDownLeftIcon color="#ff8a94" size={13} />
                  <Text className="text-xs font-semibold text-[#ff8a94]">Add expense</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-1.5 rounded-full bg-[#16211b] px-3.5 py-2"
                  onPress={() => router.push('/transaction-compose?type=INCOME')}>
                  <ArrowUpRightIcon color="#41d6b2" size={13} />
                  <Text className="text-xs font-semibold text-[#41d6b2]">Add income</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2"
                  onPress={() => router.replace('/accounts')}>
                  <WalletCardsIcon color="#8bff62" size={13} />
                  <Text className="text-xs font-semibold text-[#93a19a]">Accounts</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}

          {/* ─── Recent transactions snapshot ──────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Recent</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  Latest transactions at a glance.
                </Text>
              </View>
              <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                <Icon as={ReceiptTextIcon} className="size-5 text-[#8bff62]" />
              </View>
            </View>

            {/* Mini income/expense row */}
            {recentTransactions.length > 0 ? (
              <View className="mt-4 flex-row gap-2">
                <View className="flex-row items-center gap-1.5 rounded-full bg-[#16211b] px-3 py-2">
                  <ArrowUpRightIcon color="#41d6b2" size={13} />
                  <Text className="text-xs font-semibold text-[#41d6b2]">
                    +{formatCurrency(recentIncome)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full bg-[#1d1518] px-3 py-2">
                  <ArrowDownLeftIcon color="#ff8a94" size={13} />
                  <Text className="text-xs font-semibold text-[#ff8a94]">
                    -{formatCurrency(recentExpense)}
                  </Text>
                </View>
              </View>
            ) : null}

            {transactionsQuery.isLoading ? (
              <View className="mt-4 rounded-[20px] bg-[#131b17] p-4">
                <Text className="text-sm text-[#7f8c86]">Loading transactions…</Text>
              </View>
            ) : null}

            {!transactionsQuery.isLoading && recentTransactions.length > 0 ? (
              <View className="mt-4 overflow-hidden rounded-[20px] border border-[#17211c] bg-[#111916]">
                {recentTransactions.map((tx, index) => {
                  const isExpense = tx.type === 'EXPENSE';

                  return (
                    <View
                      key={tx.id}
                      className={`flex-row items-center gap-3 px-4 py-3 ${
                        index > 0 ? 'border-t border-[#17211c]/60' : ''
                      }`}>
                      <View
                        className={`size-9 items-center justify-center rounded-[12px] ${
                          isExpense ? 'bg-[#241719]' : 'bg-[#16211b]'
                        }`}>
                        {isExpense ? (
                          <ArrowDownLeftIcon color="#ff8a94" size={15} />
                        ) : (
                          <ArrowUpRightIcon color="#41d6b2" size={15} />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-[15px] font-semibold text-[#f4f7f5]">
                          {tx.title}
                        </Text>
                        <Text className="mt-0.5 text-xs text-[#6d786f]">
                          {formatShortDate(tx.transactionAt)}
                        </Text>
                      </View>
                      <Text
                        className={`text-[15px] font-semibold ${
                          isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
                        }`}>
                        {isExpense ? '-' : '+'}
                        {formatCurrency(Number(tx.amount), tx.currency)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {!transactionsQuery.isLoading && recentTransactions.length === 0 ? (
              <View className="mt-4 items-center rounded-[20px] bg-[#131b17] px-4 py-6">
                <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                  <ReceiptTextIcon color="#8bff62" size={22} />
                </View>
                <Text className="mt-3 text-sm leading-5 text-[#7f8c86]">
                  No transactions yet. Log your first expense to start.
                </Text>
              </View>
            ) : null}

            <Button
              className="mt-4 h-11 self-start rounded-full bg-[#131b17] px-5"
              variant="ghost"
              size="sm"
              onPress={() => router.replace('/add')}>
              <Text className="text-sm font-semibold text-[#dce2de]">View all activity</Text>
              <Icon as={ArrowUpRightIcon} className="ml-1.5 size-4 text-[#8bff62]" />
            </Button>
          </View>

          {/* ─── Upcoming section ──────────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="gap-4">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-[28px] font-semibold text-[#f4f7f5]">Upcoming</Text>
                  <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                    Recurring bills and income on your schedule.
                  </Text>
                </View>
                <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                  <Icon as={CalendarIcon} className="size-5 text-[#41d6b2]" />
                </View>
              </View>
              <Button
                className="h-12 self-start rounded-full bg-[#8bff62] px-5"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/plan-ahead')}>
                <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
                <Text className="text-sm font-semibold text-[#07110a]">Plan ahead</Text>
              </Button>
            </View>

            {plannedItemsQuery.isLoading ? (
              <View className="mt-5 rounded-[24px] bg-[#131b17] p-4">
                <Text className="text-sm leading-6 text-[#7f8c86]">Loading planned items…</Text>
              </View>
            ) : null}

            {plannedItems.length > 0 ? (
              <View className="mt-5 gap-3">
                {incomePlannedItems.length > 0 ? (
                  <View className="rounded-[24px] bg-[#131b17] p-4">
                    <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#41d6b2]">
                      Income
                    </Text>
                    <View className="mt-3 gap-2">
                      {incomePlannedItems.map((plannedItem) => {
                        const occurrenceDate =
                          plannedItem.nextOccurrenceAt ?? plannedItem.startDate;

                        return (
                          <View
                            key={plannedItem.id}
                            className="flex-row items-center gap-3 rounded-[14px] bg-[#16211b] px-3 py-2.5">
                            <View className="size-9 items-center justify-center rounded-[12px] bg-[#1f3325]">
                              <TrendingUpIcon color="#41d6b2" size={15} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-[15px] font-semibold text-[#f4f7f5]" numberOfLines={1}>
                                {plannedItem.title}
                              </Text>
                              <View className="mt-0.5 flex-row items-center gap-1.5">
                                <Text className="text-xs text-[#7f8c86]">
                                  {formatShortDate(occurrenceDate)}
                                </Text>
                                <Text className="text-[10px] text-[#4a5650]">·</Text>
                                <Text className="text-xs capitalize text-[#41d6b2]">
                                  {plannedItem.recurrence.toLowerCase()}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-[15px] font-semibold text-[#41d6b2]">
                              {formatCurrency(Number(plannedItem.amount), plannedItem.currency)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {expensePlannedItems.length > 0 ? (
                  <View className="rounded-[24px] bg-[#131b17] p-4">
                    <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#ff8a94]">
                      Expenses
                    </Text>
                    <View className="mt-3 gap-2">
                      {expensePlannedItems.map((plannedItem) => {
                        const occurrenceDate =
                          plannedItem.nextOccurrenceAt ?? plannedItem.startDate;
                        const daysUntil = getDaysUntil(occurrenceDate);
                        const showUrgency = daysUntil >= 0 && daysUntil <= 3;

                        return (
                          <View
                            key={plannedItem.id}
                            className={`flex-row items-center gap-3 rounded-[14px] px-3 py-2.5 ${
                              showUrgency ? 'bg-[#241719]' : 'bg-[#181516]'
                            }`}>
                            <View className="size-9 items-center justify-center rounded-[12px] bg-[#331f25]">
                              <TrendingDownIcon color="#ff8a94" size={15} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-[15px] font-semibold text-[#f4f7f5]" numberOfLines={1}>
                                {plannedItem.title}
                              </Text>
                              <View className="mt-0.5 flex-row items-center gap-1.5">
                                <Text className="text-xs text-[#7f8c86]">
                                  {formatShortDate(occurrenceDate)}
                                </Text>
                                <Text className="text-[10px] text-[#4a5650]">·</Text>
                                <Text className="text-xs capitalize text-[#ff8a94]">
                                  {plannedItem.recurrence.toLowerCase()}
                                </Text>
                                {showUrgency ? (
                                  <>
                                    <Text className="text-[10px] text-[#4a5650]">·</Text>
                                    <Text className="text-xs font-semibold text-[#ff8a94]">
                                      {daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
                                    </Text>
                                  </>
                                ) : null}
                              </View>
                            </View>
                            <Text className="text-[15px] font-semibold text-[#f4f7f5]">
                              {formatCurrency(Number(plannedItem.amount), plannedItem.currency)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {!plannedItemsQuery.isLoading && plannedItems.length === 0 ? (
              <View className="mt-5 items-center rounded-[24px] bg-[#131b17] px-4 py-6">
                <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                  <CalendarIcon color="#41d6b2" size={22} />
                </View>
                <Text className="mt-3 text-center text-sm leading-5 text-[#7f8c86]">
                  No planned items yet. Use "Plan ahead" to add recurring bills or income.
                </Text>
              </View>
            ) : null}
          </View>

          {/* ─── Budgets section ───────────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Budgets</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  Track spending limits and catch drift early.
                </Text>
              </View>
              <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                <Icon as={TargetIcon} className="size-5 text-[#ffc857]" />
              </View>
            </View>

            {budgetsQuery.isLoading ? (
              <View className="mt-5 rounded-[24px] bg-[#131b17] p-4">
                <Text className="text-sm leading-6 text-[#7f8c86]">Loading budgets…</Text>
              </View>
            ) : null}

            {!budgetsQuery.isLoading && budgets.length > 0 ? (
              <View className="mt-5 gap-3">
                {budgets.slice(0, 3).map((budget) => {
                  const spent = getSpentForBudget(budget, allTransactions);
                  const limit = Number(budget.amount);
                  const remaining = limit - spent;
                  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                  const isOver = spent > limit;
                  const isWarning = pct >= budget.alertThreshold;
                  const barColor = isOver ? '#ff8a94' : isWarning ? '#ffc857' : '#8bff62';

                  return (
                    <Pressable
                      key={budget.id}
                      className="rounded-[24px] bg-[#131b17] p-4"
                      onPress={() => router.push('/budgets')}>
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-[15px] font-semibold text-[#f4f7f5]" numberOfLines={1}>
                            {budget.name || 'Unnamed budget'}
                          </Text>
                          <Text className="mt-1 text-xs text-[#6d786f]">
                            {formatCurrency(spent, budget.currency)} spent of {formatCurrency(limit, budget.currency)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className={`text-[15px] font-semibold ${remaining < 0 ? 'text-[#ff8a94]' : 'text-[#f4f7f5]'}`}>
                            {formatCurrency(remaining, budget.currency)}
                          </Text>
                          <Text className="text-[11px] text-[#6d786f]">left</Text>
                        </View>
                      </View>
                      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#1a2c1f]">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                      </View>
                    </Pressable>
                  );
                })}

                {budgets.length > 3 ? (
                  <Button
                    className="mt-2 h-11 self-start rounded-full bg-[#131b17] px-5"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.push('/budgets')}>
                    <Text className="text-sm font-semibold text-[#dce2de]">View all budgets</Text>
                    <Icon as={ArrowUpRightIcon} className="ml-1.5 size-4 text-[#8bff62]" />
                  </Button>
                ) : null}
              </View>
            ) : null}

            {!budgetsQuery.isLoading && budgets.length === 0 ? (
              <View className="mt-5 flex-row items-center justify-between gap-3 rounded-[24px] bg-[#131b17] p-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#f4f7f5]">No budgets yet</Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#7f8c86]">
                    Set monthly limits by category.
                  </Text>
                </View>
                <Button
                  className="h-10 rounded-full bg-[#8bff62] px-4"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push('/budget-compose' as any)}>
                  <Text className="text-sm font-semibold text-[#07110a]">Add</Text>
                </Button>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="home" />
    </View>
  );
}
