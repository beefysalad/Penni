import { Badge } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { ActivityTransactionRow } from '@/features/finance/components/activity-sections';
import {
  AccountActionPanel,
  AccountOverviewHero,
} from '@/features/finance/components/account-detail-sections';
import { useAccountsQuery } from '@/features/finance/hooks/use-accounts-query';
import { usePlannedItemsQuery } from '@/features/finance/hooks/use-planned-items-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { ACCOUNT_TYPE_META } from '@/features/finance/lib/constants';
import {
  formatCompactDate,
  formatCurrency,
  formatDueDayOfMonth,
  formatRecurrenceLabel,
} from '@/features/finance/lib/formatters';
import {
  getAccountAvailableCredit,
  getAccountCreditLimit,
  getAccountDueDayOfMonth,
  getAccountStatementDayOfMonth,
} from '@/features/finance/lib/finance.types';
import { groupTransactionsIntoSections } from '@/features/finance/lib/selectors';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowDownLeftIcon,
  CalendarClockIcon,
  PlusIcon,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function AccountDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const accountId = typeof params.id === 'string' ? params.id : '';

  const accountsQuery = useAccountsQuery();
  const transactionsQuery = useTransactionsQuery(accountId ? { accountId } : undefined);
  const plannedItemsQuery = usePlannedItemsQuery(accountId ? { accountId, isActive: true } : undefined);

  const accounts = accountsQuery.data ?? [];
  const account = accounts.find((item) => item.id === accountId) ?? null;
  const transactions = transactionsQuery.data ?? [];
  const plannedItems = plannedItemsQuery.data ?? [];

  const transactionSections = useMemo(
    () => groupTransactionsIntoSections(transactions).slice(0, 3),
    [transactions],
  );

  const stats = useMemo(() => {
    const cashFlowTransactions = transactions.filter(
      (transaction) => transaction.source !== 'TRANSFER'
    );

    const signedCashFlowDelta = cashFlowTransactions.reduce((sum, transaction) => {
      const amount = Number(transaction.amount);
      return transaction.type === 'INCOME' ? sum + amount : sum - amount;
    }, 0);

    const openingBalance = account
      ? Number(account.balance) - signedCashFlowDelta
      : 0;

    const income = cashFlowTransactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        Math.max(openingBalance, 0)
      );
    const expense = cashFlowTransactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        Math.abs(Math.min(openingBalance, 0))
      );

    return {
      moneyIn: income,
      moneyOut: expense,
      recurringCount: plannedItems.length,
    };
  }, [account, plannedItems.length, transactions]);

  if (accountsQuery.isLoading || (accountId && (transactionsQuery.isLoading || plannedItemsQuery.isLoading))) {
    return (
      <View className="flex-1 bg-[#060b08] px-6 pb-12 pt-safe pt-4">
        <StatusBar style="light" />
        <Pressable
          className="size-14 items-center justify-center rounded-[20px] bg-[#111916]"
          onPress={() => router.back()}>
          <ArrowLeftIcon color="#d7dce0" size={26} />
        </Pressable>
        <View className="mt-6 rounded-[32px] border border-[#1b2a21] bg-[#0d1411] p-6">
          <Text className="text-base text-[#95a39c]">Loading account...</Text>
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View className="flex-1 bg-[#060b08] px-6 pb-12 pt-safe pt-4">
        <StatusBar style="light" />
        <Pressable
          className="size-14 items-center justify-center rounded-[20px] bg-[#111916]"
          onPress={() => router.back()}>
          <ArrowLeftIcon color="#d7dce0" size={26} />
        </Pressable>
        <View className="mt-6 rounded-[32px] border border-[#1b2a21] bg-[#0d1411] p-6">
          <Text className="text-[24px] font-semibold text-white">Account not found</Text>
          <Text className="mt-2 text-[15px] leading-6 text-[#95a39c]">
            This account may have been deleted or isn&apos;t available on this device anymore.
          </Text>
        </View>
      </View>
    );
  }

  const isCreditCard = account.type === 'CREDIT_CARD';

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-safe pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            className="size-14 items-center justify-center rounded-[20px] bg-[#111916]"
            onPress={() => router.back()}>
            <ArrowLeftIcon color="#d7dce0" size={26} />
          </Pressable>

          <Pressable
            className="size-14 items-center justify-center rounded-[20px] bg-[#111916]"
            onPress={() =>
              router.push({
                pathname: '/transaction-compose',
                params: {
                  mode: isCreditCard ? 'transfer' : 'expense',
                  accountId: account.id,
                  ...(isCreditCard ? { toAccountId: account.id } : null),
                },
              })
            }>
            <PlusIcon color="#7dbd78" size={24} />
          </Pressable>
        </View>

        <View className="mt-6">
          <AccountOverviewHero account={account} />
        </View>

        <View className="mt-5">
          <AccountActionPanel
            account={account}
            moneyIn={stats.moneyIn}
            moneyOut={stats.moneyOut}
            recurringCount={stats.recurringCount}
            onTransfer={() =>
              router.push({
                pathname: '/transaction-compose',
                params: {
                  mode: 'transfer',
                  accountId: account.id,
                },
              })
            }
            onAddExpense={() =>
              router.push({
                pathname: '/transaction-compose',
                params: {
                  mode: 'expense',
                  accountId: account.id,
                },
              })
            }
            onAddIncome={() =>
              router.push({
                pathname: '/transaction-compose',
                params: {
                  mode: 'income',
                  accountId: account.id,
                },
              })
            }
            onPayCard={() =>
              router.push({
                pathname: '/transaction-compose',
                params: {
                  mode: 'transfer',
                  toAccountId: account.id,
                },
              })
            }
            onPlanAhead={() => router.push('/plan-ahead')}
          />
        </View>

        <View className="mt-8">
          <View className="flex-row items-center gap-3">
            <View className="size-10 items-center justify-center rounded-full bg-[#111916]">
              <CalendarClockIcon color="#d7dce0" size={18} />
            </View>
            <Text className="text-[26px] font-semibold text-[#f4f7f5]">Transaction history</Text>
          </View>
          <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
            {isCreditCard
              ? 'Card spending, card payments, and balance moves under this account appear here.'
              : 'Expenses, income, and transfers under this account appear here.'}
          </Text>

          <View className="mt-5 overflow-hidden rounded-[28px] bg-[#111916]">
            {transactionSections.length > 0 ? (
              transactionSections.map((section) => (
                <View key={section.title} className="border-b border-[#17211c]/60 last:border-b-0">
                  <View className="px-4 pb-2 pt-4">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
                      {section.title}
                    </Text>
                  </View>
                  {section.data.map((transaction, index) => (
                    <ActivityTransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      accountType={account.type}
                      isLast={index === section.data.length - 1}
                    />
                  ))}
                </View>
              ))
            ) : (
              <View className="px-4 py-6">
                <Text className="text-sm leading-6 text-[#7f8c86]">
                  No transactions recorded for this account yet.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mt-6 rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
          <Text className="text-[24px] font-semibold text-[#f4f7f5]">Recurring tied here</Text>
          <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
            Bills or income that are already linked to this account.
          </Text>

          <View className="mt-5 gap-3">
            {plannedItems.length > 0 ? (
              plannedItems.slice(0, 6).map((item) => (
                <View key={item.id} className="rounded-[22px] bg-[#141d18] p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-[16px] font-semibold text-[#f4f7f5]">{item.title}</Text>
                      <View className="mt-2 flex-row flex-wrap items-center gap-2">
                        <Badge
                          label={item.type === 'INCOME' ? 'Income' : 'Expense'}
                          variant="subtle"
                          size="sm"
                        />
                        <Badge
                          label={formatRecurrenceLabel(item.recurrence, item.semiMonthlyDays)}
                          variant="subtle"
                          size="sm"
                          className="bg-[#18221d]"
                          textClassName="text-[#93a19a]"
                        />
                        {item.nextOccurrenceAt ? (
                          <Badge
                            label={`Next ${formatCompactDate(item.nextOccurrenceAt)}`}
                            variant="subtle"
                            size="sm"
                            className="bg-[#18221d]"
                            textClassName="text-[#93a19a]"
                          />
                        ) : null}
                      </View>
                    </View>
                    <Text
                      className={`text-[17px] font-semibold ${item.type === 'INCOME' ? 'text-[#41d6b2]' : 'text-[#ff8a94]'}`}>
                      {item.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(Number(item.amount), item.currency)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="rounded-[22px] bg-[#141d18] p-4">
                <Text className="text-sm leading-6 text-[#7f8c86]">
                  No recurring items are linked to this account yet.
                </Text>
                <Pressable
                  className="mt-4 self-start rounded-full bg-[#18221d] px-4 py-2"
                  onPress={() => router.push('/plan-ahead')}>
                  <Text className="text-sm font-semibold text-[#8bff62]">Plan ahead</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
