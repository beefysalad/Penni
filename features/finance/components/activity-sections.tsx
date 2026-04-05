import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge, Pill } from '@/components/ui/pill';
import { SearchInput } from '@/components/ui/search-input';
import { Text } from '@/components/ui/text';
import { TYPE_FILTERS, type TypeFilter } from '@/features/finance/lib/constants';
import { formatCurrency, formatShortDate } from '@/features/finance/lib/formatters';
import type { Transaction } from '@/features/finance/lib/finance.types';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
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
import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export function ActivityListHeader({
  netCashFlow,
  totalIncome,
  totalExpense,
  typeFilter,
  search,
  onChangeTypeFilter,
  onChangeSearch,
}: {
  netCashFlow: number;
  totalIncome: number;
  totalExpense: number;
  typeFilter: TypeFilter;
  search: string;
  onChangeTypeFilter: (filter: TypeFilter) => void;
  onChangeSearch: (value: string) => void;
}) {
  return (
    <View>
      <StatusBar style="light" />
      <View className="pt-safe rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-4">
        <AppPageHeader
          eyebrow="Transactions"
          title="Activity"
          subtitle="Review recent money movement, scan categories, and add a new entry fast."
          inverted
        />
      </View>

      <View className="gap-5 px-6 pt-6">
        <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-[#7f8c86]">Net cash flow</Text>
              <Text className={`mt-1 text-[34px] font-semibold tracking-[-1px] ${netCashFlow >= 0 ? 'text-[#41d6b2]' : 'text-[#ff8a94]'}`}>
                {netCashFlow >= 0 ? '+' : ''}
                {formatCurrency(netCashFlow)}
              </Text>
            </View>
            <View className={`size-12 items-center justify-center rounded-full ${netCashFlow >= 0 ? 'bg-[#1a2c1f]' : 'bg-[#2c1a1f]'}`}>
              <Icon
                as={netCashFlow >= 0 ? TrendingUpIcon : TrendingDownIcon}
                className="size-5"
                color={netCashFlow >= 0 ? '#41d6b2' : '#ff8a94'}
              />
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-[20px] bg-[#16211b] p-4">
              <View className="flex-row items-center gap-2">
                <View className="size-8 items-center justify-center rounded-full bg-[#1f3325]">
                  <ArrowUpRightIcon color="#41d6b2" size={14} />
                </View>
                <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">Income</Text>
              </View>
              <Text className="mt-3 text-xl font-semibold text-[#41d6b2]">{formatCurrency(totalIncome)}</Text>
            </View>
            <View className="flex-1 rounded-[20px] bg-[#1d1518] p-4">
              <View className="flex-row items-center gap-2">
                <View className="size-8 items-center justify-center rounded-full bg-[#331f25]">
                  <ArrowDownLeftIcon color="#ff8a94" size={14} />
                </View>
                <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">Expenses</Text>
              </View>
              <Text className="mt-3 text-xl font-semibold text-[#ff8a94]">{formatCurrency(totalExpense)}</Text>
            </View>
          </View>

          <View className="flex-row gap-2 pt-4">
            <Pressable className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2" onPress={() => router.replace('/accounts')}>
              <WalletCardsIcon color="#8bff62" size={13} />
              <Text className="text-xs font-semibold text-[#93a19a]">Accounts</Text>
            </Pressable>
            <Pressable className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2" onPress={() => router.push('/plan-ahead')}>
              <CalendarClockIcon color="#41d6b2" size={13} />
              <Text className="text-xs font-semibold text-[#93a19a]">Plan ahead</Text>
            </Pressable>
          </View>
        </View>

        <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5 pb-0">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[28px] font-semibold text-[#f4f7f5]">Recent activity</Text>
              <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">A cleaner view of your actual money movement.</Text>
            </View>
          </View>

          <Button className="mt-4 h-14 rounded-[22px] bg-[#8bff62]" onPress={() => router.push('/transaction-compose')}>
            <Icon as={PlusIcon} className="mr-2 size-5 text-[#07110a]" />
            <Text className="text-base font-semibold text-[#07110a]">New transaction</Text>
          </Button>

          <View className="flex-row gap-2 pt-5">
            {TYPE_FILTERS.map((filter) => (
              <Pill
                key={filter}
                label={filter}
                variant={filter === typeFilter ? 'selected' : 'default'}
                size="md"
                onPress={() => onChangeTypeFilter(filter)}
              />
            ))}
          </View>

          <SearchInput value={search} onChangeText={onChangeSearch} placeholder="Search transactions" className="mb-4 mt-4" />
        </View>
      </View>
    </View>
  );
}

export function ActivitySkeletonTransaction() {
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

export function ActivityEmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <View className="items-center gap-4 rounded-[24px] bg-[#131b17] px-6 py-10">
      <View className="size-16 items-center justify-center rounded-full bg-[#18221d]">
        <ReceiptTextIcon color="#8bff62" size={28} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-base font-semibold text-[#f4f7f5]">{hasSearch ? 'No matches found' : 'No transactions yet'}</Text>
        <Text className="text-center text-sm leading-5 text-[#7f8c86]">
          {hasSearch ? 'Try a different keyword or clear your search.' : 'Start logging your first expense or income to build your activity history.'}
        </Text>
      </View>
      {!hasSearch ? (
        <Button className="mt-2 h-11 rounded-full bg-[#8bff62] px-5" variant="ghost" size="sm" onPress={() => router.push('/transaction-compose')}>
          <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
          <Text className="text-sm font-semibold text-[#07110a]">Add transaction</Text>
        </Button>
      ) : null}
    </View>
  );
}

export function ActivityTransactionRow({
  transaction,
  isLast,
}: {
  transaction: Transaction;
  isLast: boolean;
}) {
  const isExpense = transaction.type === 'EXPENSE';
  const sign = isExpense ? '-' : '+';
  const isTransfer = transaction.source === 'TRANSFER';
  const amountColor = isTransfer ? 'text-[#ffd66b]' : isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]';
  const iconBg = isTransfer ? 'bg-[#2a2412]' : isExpense ? 'bg-[#241719]' : 'bg-[#16211b]';
  const sourceLabel =
    transaction.source === 'RECURRING'
      ? 'Recurring'
      : transaction.source === 'IMPORTED'
        ? 'Imported'
        : transaction.source === 'TRANSFER'
          ? 'Transfer'
          : null;

  return (
    <View className={`px-4 py-3.5 ${!isLast ? 'border-b border-[#17211c]/60' : ''}`}>
      <View className="flex-row items-center gap-3">
        <View className={`size-11 items-center justify-center rounded-[14px] ${iconBg}`}>
          {isTransfer ? (
            <WalletCardsIcon color="#ffd66b" size={17} />
          ) : isExpense ? (
            <ArrowDownLeftIcon color="#ff8a94" size={17} />
          ) : (
            <ArrowUpRightIcon color="#41d6b2" size={17} />
          )}
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[16px] font-semibold text-[#f4f7f5]" numberOfLines={1}>{transaction.title}</Text>
          <View className="mt-1 flex-row flex-wrap items-center gap-2">
            <Text className="text-[13px] text-[#6d786f]">{formatShortDate(transaction.transactionAt)}</Text>
            {sourceLabel ? (
              <Badge
                label={sourceLabel}
                variant="subtle"
                size="sm"
                className="bg-[#18221d]"
                textClassName="text-[#93a19a]"
              />
            ) : null}
          </View>
        </View>

        <Text className={`shrink-0 text-[17px] font-semibold ${amountColor}`}>
          {sign}
          {formatCurrency(Number(transaction.amount), transaction.currency)}
        </Text>
      </View>

      {transaction.notes ? (
        <Text numberOfLines={2} className="ml-14 mt-1.5 text-[13px] leading-5 text-[#7f8c86]">{transaction.notes}</Text>
      ) : null}
    </View>
  );
}

export function ActivitySwipeableRow({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.6, 0],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
        className="items-center justify-center bg-[#3d1419] px-6">
        <Animated.View style={{ transform: [{ scale }], opacity }} className="items-center gap-1">
          <Trash2Icon color="#ff8a94" size={18} />
          <Text className="text-[11px] font-semibold text-[#ff8a94]">Delete</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}>
      {children}
    </Swipeable>
  );
}

export function ActivityListFooter({ isFetchingNextPage }: { isFetchingNextPage: boolean }) {
  if (!isFetchingNextPage) return null;

  return (
    <View className="items-center py-6">
      <ActivityIndicator color="#8bff62" size="small" />
      <Text className="mt-2 text-xs text-[#6d786f]">Loading more…</Text>
    </View>
  );
}

export function ActivitySectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View className="mb-2 mt-3 flex-row items-center justify-between px-1">
      <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">{title}</Text>
      <Text className="text-xs font-medium text-[#4a5650]">{count} entr{count === 1 ? 'y' : 'ies'}</Text>
    </View>
  );
}
