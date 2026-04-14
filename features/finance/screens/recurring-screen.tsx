import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  useCompletePlannedItemMutation,
  useDeletePlannedItemMutation,
  usePlannedItemsQuery,
} from '@/features/finance/hooks/use-planned-items-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { formatCompactDate, formatCurrency, formatRecurrenceLabel } from '@/features/finance/lib/formatters';
import {
  getCompletionActionLabel,
  getPlannedItemHelperText,
  getPlannedItemRecurringState,
  getPlannedItemSections,
  getPlannedItemStatusLabel,
  type PlannedItemWithRecurringState,
} from '@/features/finance/lib/recurring';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarClockIcon,
  CheckIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react-native';
import React, { useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

function PlannedItemSwipeableRow({
  entry,
  onDelete,
  onComplete,
  isCompleting,
}: {
  entry: PlannedItemWithRecurringState;
  onDelete: () => void;
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const { item, scheduledFor, status } = entry;
  const isExpense = item.type === 'EXPENSE';
  const swipeableRef = useRef<Swipeable>(null);
  const helperText = getPlannedItemHelperText(entry);
  const statusLabel = getPlannedItemStatusLabel(status);
  const canComplete = status !== 'COMPLETE';

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, -40, 0],
      outputRange: [1, 0.8, 0],
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
        className="mb-3 ml-4 items-center justify-center rounded-[24px] bg-[#3d1419] px-6">
        <Animated.View style={{ transform: [{ scale }], opacity }} className="items-center gap-1">
          <Trash2Icon color="#ff8a94" size={20} />
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
      <View className="mb-3 rounded-[24px] bg-[#131b17] p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 flex-row items-start gap-3">
            <View
              className={`mt-0.5 size-11 items-center justify-center rounded-[14px] ${
                isExpense ? 'bg-[#241719]' : 'bg-[#16211b]'
              }`}>
              {isExpense ? (
                <ArrowDownLeftIcon color="#ff8a94" size={18} />
              ) : (
                <ArrowUpRightIcon color="#41d6b2" size={18} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#f4f7f5]" numberOfLines={1}>
                {item.title}
              </Text>
              <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
                <Text className="text-[13px] text-[#7f8c86]">{formatCompactDate(scheduledFor)}</Text>
                <Text className="text-[10px] text-[#4a5650]">·</Text>
                <Text className="text-[13px] font-medium text-[#7f8c86]">
                  {formatRecurrenceLabel(item.recurrence, item.semiMonthlyDays)}
                </Text>
                <Text className="text-[10px] text-[#4a5650]">·</Text>
                <Text
                  className={`text-[11px] font-semibold uppercase tracking-[1.3px] ${
                    status === 'OVERDUE'
                      ? 'text-[#ff8a94]'
                      : status === 'COMPLETE'
                        ? 'text-[#41d6b2]'
                        : 'text-[#ffd66b]'
                  }`}>
                  {statusLabel}
                </Text>
              </View>
              <Text className="mt-2 text-[13px] leading-5 text-[#93a19a]">{helperText}</Text>
            </View>
          </View>
          <Text
            className={`text-[17px] font-semibold tracking-tight ${
              isExpense ? 'text-[#f4f7f5]' : 'text-[#41d6b2]'
            }`}>
            {formatCurrency(Number(item.amount), item.currency)}
          </Text>
        </View>

        <View className="mt-4 flex-row items-center justify-between gap-3 pl-14">
          {canComplete ? (
            <Button
              className={`h-10 rounded-full px-4 ${
                isExpense ? 'bg-[#332021]' : 'bg-[#1b2c20]'
              }`}
              variant="ghost"
              onPress={onComplete}
              disabled={isCompleting}>
              <CheckIcon color={isExpense ? '#ff8a94' : '#41d6b2'} size={15} />
              <Text
                className={`text-sm font-semibold ${
                  isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
                }`}>
                {isCompleting ? 'Saving…' : getCompletionActionLabel(item.type)}
              </Text>
            </Button>
          ) : (
            <View className="rounded-full bg-[#16211b] px-4 py-2.5">
              <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#41d6b2]">
                Logged
              </Text>
            </View>
          )}
        </View>
      </View>
    </Swipeable>
  );
}

function PlannedItemSection({
  title,
  entries,
  onDelete,
  onComplete,
  isCompleting,
}: {
  title: string;
  entries: PlannedItemWithRecurringState[];
  onDelete: (entry: PlannedItemWithRecurringState) => void;
  onComplete: (entry: PlannedItemWithRecurringState) => void;
  isCompleting: boolean;
}) {
  return (
    <View className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
      <View className="mb-3 flex-row items-center justify-between gap-3 px-1">
        <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-[#6d786f]">
          {title}
        </Text>
        <View className="rounded-full bg-[#141d18] px-3 py-1.5">
          <Text className="text-[11px] font-semibold text-[#dce2de]">{entries.length}</Text>
        </View>
      </View>
      {entries.map((entry) => (
        <PlannedItemSwipeableRow
          key={entry.item.id}
          entry={entry}
          onDelete={() => onDelete(entry)}
          onComplete={() => onComplete(entry)}
          isCompleting={isCompleting}
        />
      ))}
    </View>
  );
}

export function RecurringScreen() {
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true });
  const transactionsQuery = useTransactionsQuery();
  const completeMutation = useCompletePlannedItemMutation();
  const deleteMutation = useDeletePlannedItemMutation();

  const rawItems = plannedItemsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  const itemsWithState = useMemo(
    () => rawItems.map((item) => getPlannedItemRecurringState(item, transactions)),
    [rawItems, transactions],
  );

  const expenseItems = useMemo(
    () => itemsWithState.filter((entry) => entry.item.type === 'EXPENSE'),
    [itemsWithState],
  );
  const incomeItems = useMemo(
    () => itemsWithState.filter((entry) => entry.item.type === 'INCOME'),
    [itemsWithState],
  );

  const expenseSections = useMemo(() => getPlannedItemSections(expenseItems), [expenseItems]);
  const incomeSections = useMemo(() => getPlannedItemSections(incomeItems), [incomeItems]);

  const summary = useMemo(() => {
    const dueCount = itemsWithState.filter((entry) => entry.status === 'DUE' || entry.status === 'OVERDUE').length;
    const completedCount = itemsWithState.filter((entry) => entry.status === 'COMPLETE').length;
    const upcomingCount = itemsWithState.filter((entry) => entry.status === 'UPCOMING').length;
    const nextUp =
      [...itemsWithState]
        .filter((entry) => entry.status !== 'COMPLETE')
        .sort(
          (left, right) =>
            new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime(),
        )[0] ?? null;

    return {
      dueCount,
      completedCount,
      upcomingCount,
      nextUp,
      totalCount: itemsWithState.length,
    };
  }, [itemsWithState]);

  const isLoading = plannedItemsQuery.isLoading || transactionsQuery.isLoading;

  const handleDelete = (entry: PlannedItemWithRecurringState) => {
    Alert.alert('Delete recurring item?', `Remove ${entry.item.title} from your schedule?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(entry.item.id),
      },
    ]);
  };

  const handleComplete = (entry: PlannedItemWithRecurringState) => {
    completeMutation.mutate({
      id: entry.item.id,
      input: {
        transactionAt: new Date().toISOString(),
      },
    });
  };

  return (
    <GestureHandlerRootView className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-32">
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Recurring"
            title="Recurring"
            subtitle="Track what is due next, what is coming up, and what you have already logged."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#7f8c86]">Recurring at a glance</Text>
                <Text className="mt-1 text-[30px] font-semibold tracking-[-1px] text-[#f4f7f5]">
                  {summary.totalCount}
                </Text>
                <Text className="mt-1 text-[14px] leading-6 text-[#7f8c86]">
                  Keep bills and incoming money visible before they hit your activity feed.
                </Text>
                {summary.nextUp ? (
                  <View className="mt-4 self-start rounded-full bg-[#141d18] px-4 py-2">
                    <Text className="text-[12px] font-semibold text-[#dce2de]">
                      Next up: {summary.nextUp.item.title} on {formatCompactDate(summary.nextUp.scheduledFor)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
                <CalendarClockIcon color="#8bff62" size={20} />
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-[20px] bg-[#1d1518] p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                    Needs action
                  </Text>
                  <Text className="mt-2 text-[24px] font-semibold text-[#ff8a94]">
                    {summary.dueCount}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#93a19a]">
                    Due today or already overdue.
                  </Text>
                </View>
                <View className="flex-1 rounded-[20px] bg-[#16211b] p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                    Logged
                  </Text>
                  <Text className="mt-2 text-[24px] font-semibold text-[#41d6b2]">
                    {summary.completedCount}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#93a19a]">
                    Already matched to transactions.
                  </Text>
                </View>
              </View>
              <View className="rounded-[20px] bg-[#141d18] p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                  Upcoming
                </Text>
                <Text className="mt-2 text-[24px] font-semibold text-[#f4f7f5]">
                  {summary.upcomingCount}
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-[#93a19a]">
                  Scheduled next, but not due yet.
                </Text>
              </View>
            </View>

            <Button
              className="mt-5 h-12 self-start rounded-full bg-[#8bff62] px-5"
              variant="ghost"
              onPress={() => router.push('/plan-ahead')}>
              <PlusIcon color="#07110a" size={16} />
              <Text className="text-sm font-semibold text-[#07110a]">Add recurring item</Text>
            </Button>
          </View>

          {isLoading ? (
            <View className="mt-10 items-center">
              <ActivityIndicator color="#8bff62" />
            </View>
          ) : null}

          {!isLoading && itemsWithState.length === 0 ? (
            <View className="items-center justify-center rounded-[30px] border border-[#17211c] bg-[#0f1512] p-8 text-center">
              <View className="mb-4 size-16 items-center justify-center rounded-full bg-[#18221d]">
                <CalendarClockIcon color="#8bff62" size={32} />
              </View>
              <Text className="text-xl font-semibold text-white">No recurring items</Text>
              <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                Add a recurring bill or income stream so Penni can show what is due before it lands.
              </Text>
            </View>
          ) : null}

          {!isLoading && expenseItems.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="mb-5 px-1">
                <Text className="text-sm font-semibold uppercase tracking-[2px] text-[#ff8a94]">
                  Expenses
                </Text>
                <Text className="mt-2 text-[15px] leading-6 text-[#7f8c86]">
                  Bills stay due until you mark them paid or Penni matches the transaction.
                </Text>
              </View>
              <View className="gap-5">
                {expenseSections.map((section) => (
                  <PlannedItemSection
                    key={section.title}
                    title={section.title}
                    entries={section.items}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                    isCompleting={completeMutation.isPending}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {!isLoading && incomeItems.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="mb-5 px-1">
                <Text className="text-sm font-semibold uppercase tracking-[2px] text-[#41d6b2]">
                  Income
                </Text>
                <Text className="mt-2 text-[15px] leading-6 text-[#7f8c86]">
                  Expected money stays projected until you mark it received or it is matched.
                </Text>
              </View>
              <View className="gap-5">
                {incomeSections.map((section) => (
                  <PlannedItemSection
                    key={section.title}
                    title={section.title}
                    entries={section.items}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                    isCompleting={completeMutation.isPending}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <AppTabBar currentTab="profile" />
    </GestureHandlerRootView>
  );
}
