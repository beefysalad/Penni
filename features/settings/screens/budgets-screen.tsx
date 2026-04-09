import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { BudgetCard } from '@/features/settings/components/budget-sections';
import { useBudgetsQuery, useDeleteBudgetMutation } from '@/features/finance/hooks/use-budgets-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { getBudgetTimingStatus, getSpentForBudget, sortBudgetsByTiming } from '@/features/finance/lib/selectors';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  GoalIcon,
  PlusIcon,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BudgetsScreen() {
  const budgetsQuery = useBudgetsQuery();
  const transactionsQuery = useTransactionsQuery();
  const categoriesQuery = useCategoriesQuery({});
  const deleteBudgetMutation = useDeleteBudgetMutation();

  const budgets = budgetsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const today = new Date();

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  const sortedBudgets = useMemo(() => sortBudgetsByTiming(budgets, today), [budgets, today]);
  const currentBudgets = useMemo(
    () => sortedBudgets.filter((budget) => getBudgetTimingStatus(budget, today) === 'CURRENT'),
    [sortedBudgets, today],
  );
  const upcomingBudgets = useMemo(
    () => sortedBudgets.filter((budget) => getBudgetTimingStatus(budget, today) === 'UPCOMING'),
    [sortedBudgets, today],
  );
  const pastBudgets = useMemo(
    () => sortedBudgets.filter((budget) => getBudgetTimingStatus(budget, today) === 'PAST'),
    [sortedBudgets, today],
  );

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Budget planning"
            title="Budgets"
            subtitle="Set monthly spending limits and track progress in real time."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <Button
            className="h-12 self-start rounded-full bg-[#8bff62] px-5"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/budget-compose' as any)}>
            <Icon as={PlusIcon} className="mr-2 size-4 text-[#07110a]" />
            <Text className="text-sm font-semibold text-[#07110a]">Add budget</Text>
          </Button>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
              <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#4a5650]">
                Current
              </Text>
              <Text className="mt-3 text-[28px] font-semibold text-[#8bff62]">{currentBudgets.length}</Text>
              <Text className="mt-1 text-[13px] leading-5 text-[#7f8c86]">Active right now.</Text>
            </View>
            <View className="flex-1 rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
              <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#4a5650]">
                Upcoming
              </Text>
              <Text className="mt-3 text-[28px] font-semibold text-[#9dd6ff]">{upcomingBudgets.length}</Text>
              <Text className="mt-1 text-[13px] leading-5 text-[#7f8c86]">Future periods.</Text>
            </View>
          </View>

          {currentBudgets.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="text-[24px] font-semibold text-[#f4f7f5]">Current budgets</Text>
              <View className="mt-4 gap-3">
                {currentBudgets.map((budget) => {
                  const spent = getSpentForBudget(budget, transactions);
                  const categoryName = budget.categoryId ? categoryMap.get(budget.categoryId) ?? null : null;

                  return (
                    <BudgetCard
                      key={budget.id}
                      budget={budget}
                      spent={spent}
                      categoryName={categoryName}
                      onDelete={() => deleteBudgetMutation.mutate(budget.id)}
                    />
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="items-center rounded-[28px] border border-[#17211c] bg-[#0f1512] px-5 py-8">
              <View className="size-14 items-center justify-center rounded-full bg-[#2a2518]">
                <GoalIcon color="#ffc857" size={24} />
              </View>
              <Text className="mt-4 text-center text-[20px] font-semibold text-[#f4f7f5]">
                No budgets yet
              </Text>
              <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                {budgets.length > 0
                  ? 'You have budgets saved, but none are active for today.'
                  : 'Create your first budget to start tracking spending against a monthly limit.'}
              </Text>
            </View>
          )}

          {upcomingBudgets.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="text-[24px] font-semibold text-[#f4f7f5]">Upcoming budgets</Text>
              <View className="mt-4 gap-3">
                {upcomingBudgets.map((budget) => {
                  const spent = getSpentForBudget(budget, transactions);
                  const categoryName = budget.categoryId ? categoryMap.get(budget.categoryId) ?? null : null;

                  return (
                    <BudgetCard
                      key={budget.id}
                      budget={budget}
                      spent={spent}
                      categoryName={categoryName}
                      onDelete={() => deleteBudgetMutation.mutate(budget.id)}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}

          {pastBudgets.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="text-[24px] font-semibold text-[#f4f7f5]">Past budgets</Text>
              <View className="mt-4 gap-3">
                {pastBudgets.map((budget) => {
                  const spent = getSpentForBudget(budget, transactions);
                  const categoryName = budget.categoryId ? categoryMap.get(budget.categoryId) ?? null : null;

                  return (
                    <BudgetCard
                      key={budget.id}
                      budget={budget}
                      spent={spent}
                      categoryName={categoryName}
                      onDelete={() => deleteBudgetMutation.mutate(budget.id)}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <AppTabBar currentTab="profile" />
    </View>
  );
}
