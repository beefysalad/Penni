import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { usePlannedItemsQuery, useDeletePlannedItemMutation } from '@/features/finance/hooks/use-planned-items-query';
import { formatCompactDate, formatCurrency } from '@/features/finance/lib/formatters';
import type { PlannedItem } from '@/features/finance/lib/finance.types';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CalendarClockIcon, PlusIcon, Trash2Icon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react-native';
import React, { useMemo, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

function PlannedItemSwipeableRow({ item, onDelete }: { item: PlannedItem; onDelete: () => void }) {
  const isExpense = item.type === 'EXPENSE';
  const occurrenceDate = item.nextOccurrenceAt ?? item.startDate;
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
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
        className="ml-4 items-center justify-center rounded-[24px] bg-[#3d1419] px-6 mb-3">
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
      <View className="flex-row items-center justify-between rounded-[24px] bg-[#131b17] p-4 mb-3">
        <View className="flex-row items-center gap-3">
          <View
            className={`size-11 items-center justify-center rounded-[14px] ${
              isExpense ? 'bg-[#241719]' : 'bg-[#16211b]'
            }`}>
            {isExpense ? (
              <TrendingDownIcon color="#ff8a94" size={18} />
            ) : (
              <TrendingUpIcon color="#41d6b2" size={18} />
            )}
          </View>
          <View>
            <Text className="text-base font-semibold text-[#f4f7f5]" numberOfLines={1}>
              {item.title}
            </Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Text className="text-[13px] text-[#7f8c86]">
                {formatCompactDate(occurrenceDate)}
              </Text>
              <Text className="text-[10px] text-[#4a5650]">·</Text>
              <Text
                className={`text-[13px] capitalize font-medium ${
                  isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
                }`}>
                {item.recurrence.toLowerCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text
          className={`text-[17px] font-semibold tracking-tight ${
            isExpense ? 'text-[#f4f7f5]' : 'text-[#41d6b2]'
          }`}>
          {formatCurrency(Number(item.amount), item.currency)}
        </Text>
      </View>
    </Swipeable>
  );
}

export function RecurringScreen() {
  const { data, isLoading } = usePlannedItemsQuery();
  const deleteMutation = useDeletePlannedItemMutation();
  const rawItems: PlannedItem[] = Array.isArray(data) ? data : [];

  const incomeItems = useMemo(
    () => rawItems.filter((i) => i.type === 'INCOME').sort((a, b) => new Date(a.nextOccurrenceAt ?? a.startDate).getTime() - new Date(b.nextOccurrenceAt ?? b.startDate).getTime()),
    [rawItems],
  );

  const expenseItems = useMemo(
    () => rawItems.filter((i) => i.type === 'EXPENSE').sort((a, b) => new Date(a.nextOccurrenceAt ?? a.startDate).getTime() - new Date(b.nextOccurrenceAt ?? b.startDate).getTime()),
    [rawItems],
  );

  return (
    <GestureHandlerRootView className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-32">
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Schedule"
            title="Recurring"
            subtitle="Manage recurring bills and income in one place."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <Pressable
            className="h-12 self-start flex-row items-center justify-center gap-2 rounded-full bg-[#8bff62] px-5"
            onPress={() => router.push('/plan-ahead')}>
            <PlusIcon color="#07110a" size={16} />
            <Text className="text-sm font-semibold text-[#07110a]">Add recurring item</Text>
          </Pressable>

          {isLoading ? (
            <View className="mt-10 items-center">
              <ActivityIndicator color="#8bff62" />
            </View>
          ) : null}

          {!isLoading && rawItems.length === 0 ? (
            <View className="items-center justify-center rounded-[30px] border border-[#17211c] bg-[#0f1512] p-8 text-center">
              <View className="mb-4 size-16 items-center justify-center rounded-full bg-[#18221d]">
                <CalendarClockIcon color="#8bff62" size={32} />
              </View>
              <Text className="text-xl font-semibold text-white">No recurring items</Text>
              <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                You haven't scheduled any recurring income or expenses yet.
              </Text>
            </View>
          ) : null}

          {!isLoading && expenseItems.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="mb-4 text-sm font-semibold uppercase tracking-[2px] text-[#ff8a94] px-1">
                Expenses
              </Text>
              {expenseItems.map((item) => (
                <PlannedItemSwipeableRow
                  key={item.id}
                  item={item}
                  onDelete={() => deleteMutation.mutate(item.id)}
                />
              ))}
            </View>
          ) : null}

          {!isLoading && incomeItems.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="mb-4 text-sm font-semibold uppercase tracking-[2px] text-[#41d6b2] px-1">
                Income
              </Text>
              {incomeItems.map((item) => (
                <PlannedItemSwipeableRow
                  key={item.id}
                  item={item}
                  onDelete={() => deleteMutation.mutate(item.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <AppTabBar currentTab="profile" />
    </GestureHandlerRootView>
  );
}
