import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Badge } from '@/components/ui/pill';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { SearchInput } from '@/components/ui/search-input';
import { Text } from '@/components/ui/text';
import {
  useDeleteTransactionMutation,
  useTransactionsQuery,
} from '@/features/finance/hooks/use-transactions-query';
import type { Transaction } from '@/features/finance/lib/finance.types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarClockIcon,
  PlusIcon,
  ReceiptTextIcon,
  Trash2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletCardsIcon,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

// ─── Filters ──────────────────────────────────────────────────────────────────

const TYPE_FILTERS = ['All', 'Expenses', 'Income'] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShortDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function formatGroupDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return new Intl.DateTimeFormat('en-PH', { weekday: 'long' }).format(date);
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function groupTransactionsByDate(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const date = new Date(tx.transactionAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(tx);
  }

  return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonTransaction() {
  return (
    <View className="flex-row items-center gap-3 px-4 py-4">
      <View className="size-11 rounded-[14px] bg-[#1a2620]" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-32 rounded-full bg-[#1a2620]" />
        <View className="h-3 w-20 rounded-full bg-[#162019]" />
      </View>
      <View className="items-end gap-2">
        <View className="h-4 w-20 rounded-full bg-[#1a2620]" />
        <View className="h-3 w-14 rounded-full bg-[#162019]" />
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <View className="items-center gap-4 rounded-[24px] bg-[#131b17] px-6 py-10">
      <View className="size-16 items-center justify-center rounded-full bg-[#18221d]">
        <ReceiptTextIcon color="#8bff62" size={28} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-base font-semibold text-[#f4f7f5]">
          {hasSearch ? 'No matches found' : 'No transactions yet'}
        </Text>
        <Text className="text-center text-sm leading-5 text-[#7f8c86]">
          {hasSearch
            ? 'Try a different keyword or clear your search.'
            : 'Start logging your first expense or income to build your activity history.'}
        </Text>
      </View>
      {!hasSearch ? (
        <Button
          className="mt-2 h-11 rounded-full bg-[#8bff62] px-5"
          variant="ghost"
          size="sm"
          onPress={() => router.push('/transaction-compose')}>
          <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
          <Text className="text-sm font-semibold text-[#07110a]">Add transaction</Text>
        </Button>
      ) : null}
    </View>
  );
}

// ─── Transaction card ─────────────────────────────────────────────────────────

function TransactionRow({
  transaction,
  isConfirmingDelete,
  isDeleting,
  onDeletePress,
  onCancelDelete,
  onConfirmDelete,
  isLast,
}: {
  transaction: Transaction;
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  onDeletePress: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  isLast: boolean;
}) {
  const isExpense = transaction.type === 'EXPENSE';
  const sign = isExpense ? '-' : '+';
  const amountColor = isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]';
  const iconBg = isExpense ? 'bg-[#241719]' : 'bg-[#16211b]';

  return (
    <View className={`px-4 py-3.5 ${!isLast ? 'border-b border-[#17211c]/60' : ''}`}>
      <View className="flex-row items-center gap-3">
        {/* Direction icon */}
        <View className={`size-11 items-center justify-center rounded-[14px] ${iconBg}`}>
          {isExpense ? (
            <ArrowDownLeftIcon color="#ff8a94" size={17} />
          ) : (
            <ArrowUpRightIcon color="#41d6b2" size={17} />
          )}
        </View>

        {/* Title + source badge */}
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-[#f4f7f5]">
            {transaction.title}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <Text className="text-[13px] text-[#6d786f]">
              {formatShortDate(transaction.transactionAt)}
            </Text>
            {transaction.source !== 'MANUAL' ? (
              <Badge
                label={transaction.source === 'RECURRING' ? 'Recurring' : 'Imported'}
                variant="subtle"
                size="sm"
                className="bg-[#18221d]"
                textClassName="text-[#93a19a]"
              />
            ) : null}
          </View>
        </View>

        {/* Amount */}
        <Text className={`text-[17px] font-semibold ${amountColor}`}>
          {sign}{formatCurrency(Number(transaction.amount), transaction.currency)}
        </Text>
      </View>

      {/* Notes */}
      {transaction.notes ? (
        <Text numberOfLines={2} className="ml-14 mt-1.5 text-[13px] leading-5 text-[#7f8c86]">
          {transaction.notes}
        </Text>
      ) : null}

      {/* Delete row */}
      {isConfirmingDelete ? (
        <View className="ml-14 mt-3 flex-row items-center gap-2">
          <Text className="flex-1 text-xs font-medium text-[#ffb4bb]">Delete this entry?</Text>
          <Pressable className="rounded-full bg-[#131b17] px-3 py-1.5" onPress={onCancelDelete}>
            <Text className="text-xs font-semibold text-[#dce2de]">Cancel</Text>
          </Pressable>
          <Pressable
            className="rounded-full bg-[#1d1416] px-3 py-1.5"
            disabled={isDeleting}
            onPress={onConfirmDelete}>
            <View className="flex-row items-center gap-1.5">
              <Trash2Icon color="#ff8a94" size={12} />
              <Text className="text-xs font-semibold text-[#ff8a94]">
                {isDeleting ? 'Deleting…' : 'Confirm'}
              </Text>
            </View>
          </Pressable>
        </View>
      ) : (
        <Pressable
          className="ml-14 mt-2 flex-row items-center gap-1.5 self-start"
          onPress={onDeletePress}>
          <Trash2Icon color="#ff8a94" size={12} />
          <Text className="text-xs font-semibold text-[#ff8a94]">Remove</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const transactionsQuery = useTransactionsQuery();
  const deleteTransactionMutation = useDeleteTransactionMutation();
  const transactions = transactionsQuery.data ?? [];

  // Summary stats
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions],
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions],
  );
  const netCashFlow = totalIncome - totalExpense;

  // Filtered + grouped
  const filteredTransactions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return transactions.filter((t) => {
      const matchesType =
        typeFilter === 'All' ||
        (typeFilter === 'Expenses' && t.type === 'EXPENSE') ||
        (typeFilter === 'Income' && t.type === 'INCOME');
      const matchesSearch =
        !needle || `${t.title} ${t.notes ?? ''}`.toLowerCase().includes(needle);

      return matchesType && matchesSearch;
    });
  }, [search, typeFilter, transactions]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions],
  );

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Transactions"
            title="Activity"
            subtitle="Review recent money movement, scan categories, and add a new entry fast."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          {/* ─── Cash-flow hero card ──────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
            {/* Net cash flow */}
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#7f8c86]">Net cash flow</Text>
                <Text
                  className={`mt-1 text-[34px] font-semibold tracking-[-1px] ${
                    netCashFlow >= 0 ? 'text-[#41d6b2]' : 'text-[#ff8a94]'
                  }`}>
                  {netCashFlow >= 0 ? '+' : ''}
                  {formatCurrency(netCashFlow)}
                </Text>
              </View>
              <View
                className={`size-12 items-center justify-center rounded-full ${
                  netCashFlow >= 0 ? 'bg-[#1a2c1f]' : 'bg-[#2c1a1f]'
                }`}>
                <Icon
                  as={netCashFlow >= 0 ? TrendingUpIcon : TrendingDownIcon}
                  className="size-5"
                  color={netCashFlow >= 0 ? '#41d6b2' : '#ff8a94'}
                />
              </View>
            </View>

            {/* Income / Expense breakdown row */}
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-[20px] bg-[#16211b] p-4">
                <View className="flex-row items-center gap-2">
                  <View className="size-8 items-center justify-center rounded-full bg-[#1f3325]">
                    <ArrowUpRightIcon color="#41d6b2" size={14} />
                  </View>
                  <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                    Income
                  </Text>
                </View>
                <Text className="mt-3 text-xl font-semibold text-[#41d6b2]">
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              <View className="flex-1 rounded-[20px] bg-[#1d1518] p-4">
                <View className="flex-row items-center gap-2">
                  <View className="size-8 items-center justify-center rounded-full bg-[#331f25]">
                    <ArrowDownLeftIcon color="#ff8a94" size={14} />
                  </View>
                  <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                    Expenses
                  </Text>
                </View>
                <Text className="mt-3 text-xl font-semibold text-[#ff8a94]">
                  {formatCurrency(totalExpense)}
                </Text>
              </View>
            </View>

            {/* Quick actions */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pt-4">
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2"
                onPress={() => router.replace('/accounts')}>
                <WalletCardsIcon color="#8bff62" size={13} />
                <Text className="text-xs font-semibold text-[#93a19a]">Accounts</Text>
              </Pressable>
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2"
                onPress={() => router.push('/plan-ahead')}>
                <CalendarClockIcon color="#41d6b2" size={13} />
                <Text className="text-xs font-semibold text-[#93a19a]">Plan ahead</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* ─── Transactions section ──────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            {/* Title + CTA */}
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Recent activity</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  A cleaner view of your actual money movement.
                </Text>
              </View>
            </View>

            {/* New transaction button */}
            <Button
              className="mt-4 h-14 rounded-[22px] bg-[#8bff62]"
              onPress={() => router.push('/transaction-compose')}>
              <Icon as={PlusIcon} className="mr-2 size-5 text-[#07110a]" />
              <Text className="text-base font-semibold text-[#07110a]">New transaction</Text>
            </Button>

            {/* Type filter pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pt-5">
              {TYPE_FILTERS.map((filter) => {
                const isActive = filter === typeFilter;

                return (
                  <Pill
                    key={filter}
                    label={filter}
                    variant={isActive ? 'selected' : 'default'}
                    size="md"
                    onPress={() => setTypeFilter(filter)}
                  />
                );
              })}
            </ScrollView>

            {/* Search */}
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search transactions"
              className="mt-4"
            />

            {/* ─── Transaction list grouped by date ─────────────────────────── */}
            <View className="mt-4 gap-3">
              {transactionsQuery.isLoading ? (
                <View className="overflow-hidden rounded-[22px] border border-[#17211c] bg-[#111916]">
                  <SkeletonTransaction />
                  <View className="border-t border-[#17211c]/60" />
                  <SkeletonTransaction />
                  <View className="border-t border-[#17211c]/60" />
                  <SkeletonTransaction />
                </View>
              ) : null}

              {!transactionsQuery.isLoading && groupedTransactions.length > 0
                ? groupedTransactions.map(([dateKey, txs]) => (
                    <View key={dateKey}>
                      {/* Date group header */}
                      <View className="mb-2 flex-row items-center justify-between px-1">
                        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
                          {formatGroupDate(txs[0].transactionAt)}
                        </Text>
                        <Text className="text-xs font-medium text-[#4a5650]">
                          {txs.length} entr{txs.length === 1 ? 'y' : 'ies'}
                        </Text>
                      </View>

                      {/* Grouped card */}
                      <View className="overflow-hidden rounded-[22px] border border-[#17211c] bg-[#111916]">
                        {txs.map((transaction, index) => (
                          <TransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            isConfirmingDelete={confirmingDeleteId === transaction.id}
                            isDeleting={deleteTransactionMutation.isPending}
                            onDeletePress={() => setConfirmingDeleteId(transaction.id)}
                            onCancelDelete={() => setConfirmingDeleteId(null)}
                            onConfirmDelete={async () => {
                              await deleteTransactionMutation.mutateAsync(transaction.id);
                              setConfirmingDeleteId(null);
                            }}
                            isLast={index === txs.length - 1}
                          />
                        ))}
                      </View>
                    </View>
                  ))
                : null}

              {!transactionsQuery.isLoading && filteredTransactions.length === 0 ? (
                <EmptyState hasSearch={search.trim().length > 0} />
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="activity" />
    </View>
  );
}
