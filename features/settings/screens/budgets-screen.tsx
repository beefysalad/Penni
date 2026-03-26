import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useBudgetsQuery, useDeleteBudgetMutation } from '@/features/finance/hooks/use-budgets-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import type { Budget } from '@/features/finance/lib/finance.types';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  GoalIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
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

// ─── Progress bar ─────────────────────────────────────────────────────────────

function BudgetProgressBar({ spent, limit, alertThreshold }: { spent: number; limit: number; alertThreshold: number }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = spent > limit;
  const isWarning = pct >= alertThreshold;

  const barColor = isOver ? '#ff8a94' : isWarning ? '#ffc857' : '#8bff62';

  return (
    <View className="mt-3">
      <View className="h-2 overflow-hidden rounded-full bg-[#1a2c1f]">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </View>
      <View className="mt-1.5 flex-row justify-between">
        <Text className="text-[11px] text-[#6d786f]">{Math.round(pct)}% used</Text>
        <Text className={`text-[11px] font-semibold ${isOver ? 'text-[#ff8a94]' : isWarning ? 'text-[#ffc857]' : 'text-[#6d786f]'}`}>
          {isOver ? 'Over budget' : isWarning ? 'Approaching limit' : 'On track'}
        </Text>
      </View>
    </View>
  );
}

// ─── Budget card ──────────────────────────────────────────────────────────────

function BudgetCard({
  budget,
  spent,
  categoryName,
  onDelete,
}: {
  budget: Budget;
  spent: number;
  categoryName: string | null;
  onDelete: () => void;
}) {
  const limit = Number(budget.amount);
  const remaining = limit - spent;

  return (
    <View className="rounded-[24px] bg-[#131b17] p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-[#f4f7f5]" numberOfLines={1}>
            {budget.name || 'Unnamed budget'}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Text className="text-xs text-[#6d786f]">
              {formatPeriod(budget.periodStart, budget.periodEnd)}
            </Text>
            {categoryName ? (
              <>
                <Text className="text-[10px] text-[#4a5650]">·</Text>
                <Text className="text-xs text-[#41d6b2]">{categoryName}</Text>
              </>
            ) : null}
          </View>
        </View>
        <View className="items-end">
          <Text className={`text-lg font-semibold ${remaining < 0 ? 'text-[#ff8a94]' : 'text-[#f4f7f5]'}`}>
            {formatCurrency(remaining, budget.currency)}
          </Text>
          <Text className="text-[11px] text-[#6d786f]">remaining</Text>
        </View>
      </View>

      <BudgetProgressBar spent={spent} limit={limit} alertThreshold={budget.alertThreshold} />

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs text-[#7f8c86]">
          {formatCurrency(spent, budget.currency)} of {formatCurrency(limit, budget.currency)}
        </Text>
        <Pressable
          className="flex-row items-center gap-1.5"
          onPress={onDelete}>
          <Trash2Icon color="#ff8a94" size={14} />
          <Text className="text-xs font-semibold text-[#ff8a94]">Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
