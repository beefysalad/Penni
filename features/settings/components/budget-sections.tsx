import { Text } from '@/components/ui/text';
import { formatCurrency, formatPeriod } from '@/features/finance/lib/formatters';
import type { Budget } from '@/features/finance/lib/finance.types';
import { Trash2Icon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function BudgetProgressBar({
  spent,
  limit,
  alertThreshold,
}: {
  spent: number;
  limit: number;
  alertThreshold: number;
}) {
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
        <Text
          className={`text-[11px] font-semibold ${isOver ? 'text-[#ff8a94]' : isWarning ? 'text-[#ffc857]' : 'text-[#6d786f]'}`}>
          {isOver ? 'Over budget' : isWarning ? 'Approaching limit' : 'On track'}
        </Text>
      </View>
    </View>
  );
}

export function BudgetCard({
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
          <Text
            className={`text-lg font-semibold ${remaining < 0 ? 'text-[#ff8a94]' : 'text-[#f4f7f5]'}`}>
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
        <Pressable className="flex-row items-center gap-1.5" onPress={onDelete}>
          <Trash2Icon color="#ff8a94" size={14} />
          <Text className="text-xs font-semibold text-[#ff8a94]">Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}
