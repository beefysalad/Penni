import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Text } from '@/components/ui/text';
import { BudgetCard } from '@/features/settings/components/budget-sections';
import { useBudgetsQuery, useDeleteBudgetMutation } from '@/features/finance/hooks/use-budgets-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { getBudgetTimingStatus, getSpentForBudget, sortBudgetsByTiming } from '@/features/finance/lib/selectors';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { GoalIcon, PlusIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  countColor,
  countBg,
}: {
  title: string;
  count: number;
  countColor: string;
  countBg: string;
}) {
  return (
    <View className="flex-row items-center justify-between px-0.5">
      <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">{title}</Text>
      <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: countBg }}>
        <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: countColor }}>
          {count} {title.toLowerCase()}
        </Text>
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

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
    for (const cat of categories) map.set(cat.id, cat.name);
    return map;
  }, [categories]);

  const sortedBudgets = useMemo(() => sortBudgetsByTiming(budgets, today), [budgets, today]);
  const currentBudgets = useMemo(
    () => sortedBudgets.filter((b) => getBudgetTimingStatus(b, today) === 'CURRENT'),
    [sortedBudgets, today],
  );
  const upcomingBudgets = useMemo(
    () => sortedBudgets.filter((b) => getBudgetTimingStatus(b, today) === 'UPCOMING'),
    [sortedBudgets, today],
  );
  const pastBudgets = useMemo(
    () => sortedBudgets.filter((b) => getBudgetTimingStatus(b, today) === 'PAST'),
    [sortedBudgets, today],
  );

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Budget planning"
            title="Budgets"
            subtitle="Set spending limits and track category drift over any period."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          {/* ── Stat chips ── */}
          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full border border-[#17211c] bg-[#111916] px-3 py-2">
              <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Now</Text>
              <Text className="text-[14px] font-bold text-[#8bff62]">{currentBudgets.length}</Text>
            </View>
            <View className="flex-row items-center gap-1.5 rounded-full border border-[#17211c] bg-[#111916] px-3 py-2">
              <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Next</Text>
              <Text className="text-[14px] font-bold text-[#9dd6ff]">{upcomingBudgets.length}</Text>
            </View>
            <View className="flex-row items-center gap-1.5 rounded-full border border-[#17211c] bg-[#111916] px-3 py-2">
              <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Past</Text>
              <Text className="text-[14px] font-bold text-[#93a19a]">{pastBudgets.length}</Text>
            </View>
          </View>

          {/* ── Add button (standard green pill, own line) ── */}
          <Pressable
            className="h-12 self-start flex-row items-center justify-center gap-2 rounded-full bg-[#8bff62] px-5"
            onPress={() => router.push('/budget-compose' as any)}
          >
            <PlusIcon color="#07110a" size={16} />
            <Text className="text-sm font-semibold text-[#07110a]">Add budget</Text>
          </Pressable>

          {/* ── Current budgets ── */}
          <View className="gap-2.5">
            <SectionHeader title="Current" count={currentBudgets.length} countColor="#8bff62" countBg="#16211b" />

            {currentBudgets.length > 0 ? (
              currentBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  spent={getSpentForBudget(budget, transactions)}
                  categoryName={budget.categoryId ? categoryMap.get(budget.categoryId) ?? null : null}
                  onDelete={() => deleteBudgetMutation.mutate(budget.id)}
                />
              ))
            ) : (
              <View className="items-center rounded-[24px] border border-[#17211c] bg-[#0f1512] px-5 py-8">
                <View className="size-12 items-center justify-center rounded-full bg-[#2a2518]">
                  <GoalIcon color="#ffc857" size={20} />
                </View>
                <Text className="mt-3 text-center text-[16px] font-bold text-[#f4f7f5]">
                  No budgets yet
                </Text>
                <Text className="mt-1.5 text-center text-[13px] leading-5 text-[#7f8c86]">
                  {budgets.length > 0
                    ? 'None active for today.'
                    : 'Create your first budget to track spending.'}
                </Text>
              </View>
            )}
          </View>

          {/* ── Upcoming budgets ── */}
          {upcomingBudgets.length > 0 ? (
            <View className="gap-2.5">
              <SectionHeader title="Upcoming" count={upcomingBudgets.length} countColor="#9dd6ff" countBg="#151f25" />
              {upcomingBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  spent={getSpentForBudget(budget, transactions)}
                  categoryName={budget.categoryId ? categoryMap.get(budget.categoryId) ?? null : null}
                  onDelete={() => deleteBudgetMutation.mutate(budget.id)}
                />
              ))}
            </View>
          ) : null}

          {/* ── Past budgets ── */}
          {pastBudgets.length > 0 ? (
            <View className="gap-2.5">
              <SectionHeader title="Past" count={pastBudgets.length} countColor="#93a19a" countBg="#18221d" />
              {pastBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  spent={getSpentForBudget(budget, transactions)}
                  categoryName={budget.categoryId ? categoryMap.get(budget.categoryId) ?? null : null}
                  onDelete={() => deleteBudgetMutation.mutate(budget.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <AppTabBar currentTab="profile" />
    </View>
  );
}
