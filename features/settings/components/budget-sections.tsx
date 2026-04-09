import { Text } from '@/components/ui/text';
import { formatCurrency, formatPeriod } from '@/features/finance/lib/formatters';
import type { Budget } from '@/features/finance/lib/finance.types';
import { getBudgetTimingStatus } from '@/features/finance/lib/selectors';
import { Trash2Icon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

// ─── Progress bar ──────────────────────────────────────────────────────────────

function getProgressState(spent: number, limit: number, alertThreshold: number) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = spent > limit;
  const isReached = !isOver && limit > 0 && spent >= limit;
  const isWarning = pct >= alertThreshold;
  return {
    pct,
    label: isOver ? 'Over budget' : isReached ? 'Reached' : isWarning ? 'Approaching' : 'On track',
    labelColor: isOver ? '#ff8a94' : isReached || isWarning ? '#ffc857' : '#4a5650',
    barColor: isOver ? '#ff8a94' : isReached || isWarning ? '#ffc857' : '#8bff62',
  };
}

// ─── Budget card ───────────────────────────────────────────────────────────────

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
  const { pct, label, labelColor, barColor } = getProgressState(spent, limit, budget.alertThreshold);

  const timingStatus = getBudgetTimingStatus(budget);
  const statusLabel =
    timingStatus === 'CURRENT' ? 'Current' : timingStatus === 'UPCOMING' ? 'Upcoming' : 'Past';
  const statusBg =
    timingStatus === 'CURRENT' ? '#16211b' : timingStatus === 'UPCOMING' ? '#151f25' : '#18221d';
  const statusText =
    timingStatus === 'CURRENT' ? '#8bff62' : timingStatus === 'UPCOMING' ? '#9dd6ff' : '#93a19a';

  return (
    <View className="gap-3 rounded-[20px] border border-[#17211c] bg-[#0f1512] p-4">
      {/* Top row: name + delete */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-[#f4f7f5]" numberOfLines={1}>
            {budget.name || categoryName || 'Unnamed budget'}
          </Text>
          <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
            <Text className="text-[11px] text-[#4a5650]">
              {formatPeriod(budget.periodStart, budget.periodEnd)}
            </Text>
            {/* Status pill */}
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: statusBg }}>
              <Text className="text-[9px] font-bold uppercase tracking-[1.2px]" style={{ color: statusText }}>
                {statusLabel}
              </Text>
            </View>
            {categoryName ? (
              <Text className="text-[11px] text-[#41d6b2]">{categoryName}</Text>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onDelete}
          className="size-8 items-center justify-center rounded-full bg-[#241719]"
          hitSlop={8}
        >
          <Trash2Icon color="#ff8a94" size={14} />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View className="h-1.5 overflow-hidden rounded-full bg-[#1a2c1f]">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </View>

      {/* Bottom row: remaining + status label */}
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-[12px] font-semibold" style={{ color: remaining < 0 ? '#ff8a94' : '#93a19a' }}>
          {remaining < 0 ? 'Over ' : ''}{formatCurrency(Math.abs(remaining), budget.currency)} left
          {'  '}
          <Text className="text-[#4a5650] font-normal">
            of {formatCurrency(limit, budget.currency)}
          </Text>
        </Text>
        <Text className="text-[11px] font-bold" style={{ color: labelColor }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
