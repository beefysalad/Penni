import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { ActivityTransactionRow } from '@/features/finance/components/activity-sections';
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
import { groupTransactionsIntoSections } from '@/features/finance/lib/selectors';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CalendarClockIcon, WalletCardsIcon } from 'lucide-react-native';
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
    const income = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const expense = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    return {
      moneyIn: income,
      moneyOut: expense,
      recurringCount: plannedItems.length,
    };
  }, [plannedItems.length, transactions]);

  if (accountsQuery.isLoading || (accountId && (transactionsQuery.isLoading || plannedItemsQuery.isLoading))) {
    return (
      <View className="flex-1 bg-[#060b08] px-6 pb-12 pt-safe pt-4">
        <StatusBar style="light" />
        <Button
          variant="ghost"
          className="h-11 self-start rounded-full bg-[#111916] px-4"
          onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
        </Button>
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
        <Button
          variant="ghost"
          className="h-11 self-start rounded-full bg-[#111916] px-4"
          onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
        </Button>
        <View className="mt-6 rounded-[32px] border border-[#1b2a21] bg-[#0d1411] p-6">
          <Text className="text-[24px] font-semibold text-white">Account not found</Text>
          <Text className="mt-2 text-[15px] leading-6 text-[#95a39c]">
            This account may have been deleted or isn&apos;t available on this device anymore.
          </Text>
        </View>
      </View>
    );
  }

  const meta = ACCOUNT_TYPE_META[account.type];
  const TypeIcon = meta.icon;
  const isCreditCard = account.type === 'CREDIT_CARD';
  const availableCredit = Number(account.availableCredit ?? 0);
  const creditLimit = Number(account.creditLimit ?? 0);
  const usedCredit = Math.max(0, creditLimit - availableCredit);

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
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[2.4px] text-[#8bff62]">
                Account overview
              </Text>
              <Text className="mt-4 text-[28px] font-semibold text-white">{account.name}</Text>
              <View className="mt-3 flex-row flex-wrap items-center gap-2">
                <Badge label={meta.label} variant="subtle" size="sm" />
                <Badge
                  label={account.currency}
                  variant="subtle"
                  size="sm"
                  className="bg-[#18221d]"
                  textClassName="text-[#93a19a]"
                />
                {account.institutionName ? (
                  <Badge
                    label={account.institutionName}
                    variant="subtle"
                    size="sm"
                    className="bg-[#18221d]"
                    textClassName="text-[#93a19a]"
                  />
                ) : null}
              </View>
            </View>

            <View
              className={`size-14 items-center justify-center rounded-[20px] ${meta.iconWrapClassName}`}>
              <TypeIcon color={meta.accentColor} size={28} />
            </View>
          </View>

          <Text className="mt-6 text-sm font-medium text-[#7f8c86]">
            {isCreditCard ? 'Available credit' : 'Current balance'}
          </Text>
          <Text className="mt-2 text-[34px] font-semibold tracking-[-1px] text-[#f4f7f5]">
            {formatCurrency(
              isCreditCard ? availableCredit : Number(account.balance),
              account.currency,
            )}
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            {isCreditCard ? (
              <>
                <View className="min-w-[120px] flex-1 rounded-[20px] bg-[#141d18] p-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
                    Used
                  </Text>
                  <Text className="mt-2 text-[18px] font-semibold text-[#ff8a94]">
                    {formatCurrency(usedCredit, account.currency)}
                  </Text>
                </View>
                <View className="min-w-[120px] flex-1 rounded-[20px] bg-[#141d18] p-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
                    Limit
                  </Text>
                  <Text className="mt-2 text-[18px] font-semibold text-[#f4f7f5]">
                    {formatCurrency(creditLimit, account.currency)}
                  </Text>
                </View>
                {account.dueDayOfMonth ? (
                  <View className="min-w-[120px] flex-1 rounded-[20px] bg-[#141d18] p-4">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
                      Due day
                    </Text>
                    <Text className="mt-2 text-[18px] font-semibold text-[#ffc857]">
                      {formatDueDayOfMonth(account.dueDayOfMonth)}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                <View className="min-w-[120px] flex-1 rounded-[20px] bg-[#141d18] p-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
                    Money in
                  </Text>
                  <Text className="mt-2 text-[18px] font-semibold text-[#41d6b2]">
                    {formatCurrency(stats.moneyIn, account.currency)}
                  </Text>
                </View>
                <View className="min-w-[120px] flex-1 rounded-[20px] bg-[#141d18] p-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
                    Money out
                  </Text>
                  <Text className="mt-2 text-[18px] font-semibold text-[#ff8a94]">
                    {formatCurrency(stats.moneyOut, account.currency)}
                  </Text>
                </View>
                <View className="min-w-[120px] flex-1 rounded-[20px] bg-[#141d18] p-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
                    Recurring
                  </Text>
                  <Text className="mt-2 text-[18px] font-semibold text-[#f4f7f5]">
                    {stats.recurringCount}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View className="mt-6 rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[24px] font-semibold text-[#f4f7f5]">Quick stats</Text>
              <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                A simple snapshot of what this account is doing lately.
              </Text>
            </View>
          </View>

          <View className="mt-5 gap-3">
            <View className="rounded-[22px] bg-[#141d18] p-4">
              <View className="flex-row items-center gap-2">
                <ArrowUpRightIcon color="#41d6b2" size={16} />
                <Text className="text-[12px] font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                  Money in
                </Text>
              </View>
              <Text className="mt-3 text-[24px] font-semibold text-[#41d6b2]">
                {formatCurrency(stats.moneyIn, account.currency)}
              </Text>
            </View>
            <View className="rounded-[22px] bg-[#141d18] p-4">
              <View className="flex-row items-center gap-2">
                <ArrowDownLeftIcon color="#ff8a94" size={16} />
                <Text className="text-[12px] font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                  Money out
                </Text>
              </View>
              <Text className="mt-3 text-[24px] font-semibold text-[#ff8a94]">
                {formatCurrency(stats.moneyOut, account.currency)}
              </Text>
            </View>
            <View className="rounded-[22px] bg-[#141d18] p-4">
              <View className="flex-row items-center gap-2">
                <CalendarClockIcon color="#8bff62" size={16} />
                <Text className="text-[12px] font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                  Linked recurring items
                </Text>
              </View>
              <Text className="mt-3 text-[24px] font-semibold text-[#f4f7f5]">
                {plannedItems.length}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
          <Text className="text-[24px] font-semibold text-[#f4f7f5]">Recent activity</Text>
          <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
            The latest transactions recorded against this account.
          </Text>

          <View className="mt-5 overflow-hidden rounded-[24px] bg-[#0f1512]">
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
