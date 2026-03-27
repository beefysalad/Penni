import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { BudgetCard } from '@/features/settings/components/budget-sections';
import { useBudgetsQuery, useDeleteBudgetMutation } from '@/features/finance/hooks/use-budgets-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { getSpentForBudget } from '@/features/finance/lib/selectors';
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

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <View className="mb-4">
            <Button
              variant="ghost"
              className="h-11 self-start rounded-full bg-[#111916] px-4"
              onPress={() => router.back()}>
              <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
            </Button>
          </View>

          <AppPageHeader
            eyebrow="Budget planning"
            title="Budgets"
            subtitle="Set monthly spending limits and track progress in real time."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          {/* ─── Active budgets ─────────────────────────────────────────────── */}
          {budgets.length > 0 ? (
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="text-[24px] font-semibold text-[#f4f7f5]">Active budgets</Text>
              <View className="mt-4 gap-3">
                {budgets.map((budget) => {
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
                Create your first budget to start tracking spending against a monthly limit.
              </Text>
            </View>
          )}

          {/* ─── Add budget button ─────────────────────────────────────────── */}
          <Button
            className="h-14 rounded-[22px] bg-[#ffc857]"
            onPress={() => router.push('/budget-compose' as any)}>
            <Icon as={PlusIcon} className="mr-2 size-5 text-[#07110a]" />
            <Text className="text-base font-semibold text-[#07110a]">Add budget</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
