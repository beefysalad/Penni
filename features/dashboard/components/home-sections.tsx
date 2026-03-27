import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getDaysUntil } from '@/features/dashboard/lib/home-helpers';
import { formatCompactDate, formatCurrency } from '@/features/finance/lib/formatters';
import { getSpentForBudget } from '@/features/finance/lib/selectors';
import type { Budget, PlannedItem, Transaction } from '@/features/finance/lib/finance.types';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  PlusIcon,
  ReceiptTextIcon,
  TargetIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletCardsIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

export function SkeletonHeroCard() {
  return (
    <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
      <View className="h-4 w-20 rounded-full bg-[#1a2620]" />
      <View className="mt-3 h-10 w-40 rounded-full bg-[#1a2620]" />
      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-[20px] bg-[#18221d] p-4">
          <View className="h-3 w-16 rounded-full bg-[#1f3325]" />
          <View className="mt-3 h-6 w-28 rounded-full bg-[#1f3325]" />
        </View>
        <View className="flex-1 rounded-[20px] bg-[#18221d] p-4">
          <View className="h-3 w-16 rounded-full bg-[#1f3325]" />
          <View className="mt-3 h-6 w-28 rounded-full bg-[#1f3325]" />
        </View>
      </View>
    </View>
  );
}

export function HomeBalanceHero({
  totalBalance,
  topAccountName,
  topAccountBalance,
  expenseCategoriesCount,

  onAddIncome,
  onOpenAccounts,
}: {
  totalBalance: number;
  topAccountName: string;
  topAccountBalance: string | null;
  expenseCategoriesCount: number;

  onAddIncome: () => void;
  onOpenAccounts: () => void;
}) {
  const isNegative = totalBalance < 0;

  return (
    <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-sm font-medium text-white/65">Net worth</Text>
          <Text
            className={`mt-2 text-[34px] font-semibold tracking-[-1px] ${isNegative ? 'text-[#ff8a94]' : 'text-white'}`}>
            {formatCurrency(totalBalance)}
          </Text>
        </View>
        <View className={`rounded-full px-3 py-2 ${isNegative ? 'bg-[#2c1a1f]' : 'bg-[#1a2c1f]'}`}>
          <Text
            className={`text-xs font-semibold uppercase tracking-[1.8px] ${isNegative ? 'text-[#ff8a94]' : 'text-[#8bff62]'}`}>
            {isNegative ? 'Liability' : 'Live'}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-[24px] bg-[#18221d] p-4">
          <View className="size-10 items-center justify-center rounded-full bg-[#1f3325]">
            <Icon as={WalletCardsIcon} className="size-5 text-[#8bff62]" />
          </View>
          <Text className="mt-4 text-xs font-semibold uppercase tracking-[1.8px] text-[#93a19a]">
            Main account
          </Text>
          <Text className="mt-2 text-[17px] font-semibold leading-6 text-white">
            {topAccountName}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-[#93a19a]">
            {topAccountBalance ?? 'Add your first account to start tracking.'}
          </Text>
        </View>
        <View className="flex-1 rounded-[24px] bg-[#141b1f] p-4">
          <View className="size-10 items-center justify-center rounded-full bg-[#1c2830]">
            <Icon as={CalendarIcon} className="size-5 text-[#41d6b2]" />
          </View>
          <Text className="mt-4 text-xs font-semibold uppercase tracking-[1.8px] text-[#93a19a]">
            Categories
          </Text>
          <Text className="mt-2 text-[17px] font-semibold leading-6 text-white">
            {expenseCategoriesCount > 0 ? `${expenseCategoriesCount} ready` : 'Not set up'}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-[#93a19a]">
            {expenseCategoriesCount > 0
              ? 'Spending buckets are ready for logging.'
              : 'Default categories will appear once synced.'}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 pt-4">
        <Pressable
          className="flex-row items-center gap-1.5 rounded-full bg-[#16211b] px-3.5 py-2"
          onPress={onAddIncome}>
          <ArrowUpRightIcon color="#41d6b2" size={13} />
          <Text className="text-xs font-semibold text-[#41d6b2]">Add Transaction</Text>
        </Pressable>
        <Pressable
          className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2"
          onPress={onOpenAccounts}>
          <WalletCardsIcon color="#8bff62" size={13} />
          <Text className="text-xs font-semibold text-[#93a19a]">Accounts</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function RecentTransactionsSection({
  isLoading,
  recentTransactions,
  recentIncome,
  recentExpense,
  onOpenActivity,
}: {
  isLoading: boolean;
  recentTransactions: Transaction[];
  recentIncome: number;
  recentExpense: number;
  onOpenActivity: () => void;
}) {
  return (
    <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-[28px] font-semibold text-[#f4f7f5]">Recent</Text>
          <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
            Latest transactions at a glance.
          </Text>
        </View>
        <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Icon as={ReceiptTextIcon} className="size-5 text-[#8bff62]" />
        </View>
      </View>

      {recentTransactions.length > 0 ? (
        <View className="mt-4 flex-row gap-2">
          <View className="flex-row items-center gap-1.5 rounded-full bg-[#16211b] px-3 py-2">
            <ArrowUpRightIcon color="#41d6b2" size={13} />
            <Text className="text-xs font-semibold text-[#41d6b2]">
              +{formatCurrency(recentIncome)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-[#1d1518] px-3 py-2">
            <ArrowDownLeftIcon color="#ff8a94" size={13} />
            <Text className="text-xs font-semibold text-[#ff8a94]">
              -{formatCurrency(recentExpense)}
            </Text>
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <View className="mt-4 rounded-[20px] bg-[#131b17] p-4">
          <Text className="text-sm text-[#7f8c86]">Loading transactions…</Text>
        </View>
      ) : null}

      {!isLoading && recentTransactions.length > 0 ? (
        <View className="mt-4 overflow-hidden rounded-[20px] border border-[#17211c] bg-[#111916]">
          {recentTransactions.map((transaction, index) => {
            const isExpense = transaction.type === 'EXPENSE';

            return (
              <View
                key={transaction.id}
                className={`flex-row items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-[#17211c]/60' : ''}`}>
                <View
                  className={`size-9 items-center justify-center rounded-[12px] ${isExpense ? 'bg-[#241719]' : 'bg-[#16211b]'}`}>
                  {isExpense ? (
                    <ArrowDownLeftIcon color="#ff8a94" size={15} />
                  ) : (
                    <ArrowUpRightIcon color="#41d6b2" size={15} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-[#f4f7f5]">
                    {transaction.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-[#6d786f]">
                    {formatCompactDate(transaction.transactionAt)}
                  </Text>
                </View>
                <Text
                  className={`text-[15px] font-semibold ${isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'}`}>
                  {isExpense ? '-' : '+'}
                  {formatCurrency(Number(transaction.amount), transaction.currency)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {!isLoading && recentTransactions.length === 0 ? (
        <View className="mt-4 items-center rounded-[20px] bg-[#131b17] px-4 py-6">
          <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
            <ReceiptTextIcon color="#8bff62" size={22} />
          </View>
          <Text className="mt-3 text-sm leading-5 text-[#7f8c86]">
            No transactions yet. Log your first expense to start.
          </Text>
        </View>
      ) : null}

      <Button
        className="mt-4 h-11 self-start rounded-full bg-[#131b17] px-5"
        variant="ghost"
        size="sm"
        onPress={onOpenActivity}>
        <Text className="text-sm font-semibold text-[#dce2de]">View all</Text>
        <Icon as={ArrowUpRightIcon} className="ml-1.5 size-4 text-[#8bff62]" />
      </Button>
    </View>
  );
}

export function UpcomingSection({
  isLoading,
  plannedItems,
  incomePlannedItems,
  expensePlannedItems,
  onPlanAhead,
  onOpenRecurring,
}: {
  isLoading: boolean;
  plannedItems: PlannedItem[];
  incomePlannedItems: PlannedItem[];
  expensePlannedItems: PlannedItem[];
  onPlanAhead: () => void;
  onOpenRecurring: () => void;
}) {
  return (
    <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
      <View className="gap-4">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[28px] font-semibold text-[#f4f7f5]">Upcoming</Text>
            <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
              Recurring bills and income on your schedule.
            </Text>
          </View>
          <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
            <Icon as={CalendarIcon} className="size-5 text-[#41d6b2]" />
          </View>
        </View>
        <Button
          className="h-12 self-start rounded-full bg-[#8bff62] px-5"
          variant="ghost"
          size="sm"
          onPress={onPlanAhead}>
          <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
          <Text className="text-sm font-semibold text-[#07110a]">Plan ahead</Text>
        </Button>
      </View>

      {isLoading ? (
        <View className="mt-5 rounded-[24px] bg-[#131b17] p-4">
          <Text className="text-sm leading-6 text-[#7f8c86]">Loading planned items…</Text>
        </View>
      ) : null}

      {plannedItems.length > 0 ? (
        <View className="mt-5 gap-3">
          {incomePlannedItems.length > 0 ? (
            <View className="rounded-[24px] bg-[#131b17] p-4">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#41d6b2]">
                Income
              </Text>
              <View className="mt-3 gap-2">
                {incomePlannedItems.map((plannedItem) => {
                  const occurrenceDate = plannedItem.nextOccurrenceAt ?? plannedItem.startDate;

                  return (
                    <View
                      key={plannedItem.id}
                      className="flex-row items-center gap-3 rounded-[14px] bg-[#16211b] px-3 py-2.5">
                      <View className="size-9 items-center justify-center rounded-[12px] bg-[#1f3325]">
                        <TrendingUpIcon color="#41d6b2" size={15} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[15px] font-semibold text-[#f4f7f5]"
                          numberOfLines={1}>
                          {plannedItem.title}
                        </Text>
                        <View className="mt-0.5 flex-row items-center gap-1.5">
                          <Text className="text-xs text-[#7f8c86]">
                            {formatCompactDate(occurrenceDate)}
                          </Text>
                          <Text className="text-[10px] text-[#4a5650]">·</Text>
                          <Text className="text-xs capitalize text-[#41d6b2]">
                            {plannedItem.recurrence.toLowerCase()}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[15px] font-semibold text-[#41d6b2]">
                        {formatCurrency(Number(plannedItem.amount), plannedItem.currency)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {expensePlannedItems.length > 0 ? (
            <View className="rounded-[24px] bg-[#131b17] p-4">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#ff8a94]">
                Expenses
              </Text>
              <View className="mt-3 gap-2">
                {expensePlannedItems.map((plannedItem) => {
                  const occurrenceDate = plannedItem.nextOccurrenceAt ?? plannedItem.startDate;
                  const daysUntil = getDaysUntil(occurrenceDate);
                  const showUrgency = daysUntil >= 0 && daysUntil <= 3;

                  return (
                    <View
                      key={plannedItem.id}
                      className={`flex-row items-center gap-3 rounded-[14px] px-3 py-2.5 ${showUrgency ? 'bg-[#241719]' : 'bg-[#181516]'}`}>
                      <View className="size-9 items-center justify-center rounded-[12px] bg-[#331f25]">
                        <TrendingDownIcon color="#ff8a94" size={15} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[15px] font-semibold text-[#f4f7f5]"
                          numberOfLines={1}>
                          {plannedItem.title}
                        </Text>
                        <View className="mt-0.5 flex-row items-center gap-1.5">
                          <Text className="text-xs text-[#7f8c86]">
                            {formatCompactDate(occurrenceDate)}
                          </Text>
                          <Text className="text-[10px] text-[#4a5650]">·</Text>
                          <Text className="text-xs capitalize text-[#ff8a94]">
                            {plannedItem.recurrence.toLowerCase()}
                          </Text>
                          {showUrgency ? (
                            <>
                              <Text className="text-[10px] text-[#4a5650]">·</Text>
                              <Text className="text-xs font-semibold text-[#ff8a94]">
                                {daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
                              </Text>
                            </>
                          ) : null}
                        </View>
                      </View>
                      <Text className="text-[15px] font-semibold text-[#f4f7f5]">
                        {formatCurrency(Number(plannedItem.amount), plannedItem.currency)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {!isLoading && plannedItems.length === 0 ? (
        <View className="mt-5 items-center rounded-[24px] bg-[#131b17] px-4 py-6">
          <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
            <CalendarIcon color="#41d6b2" size={22} />
          </View>
          <Text className="mt-3 text-center text-sm leading-5 text-[#7f8c86]">
            No planned items yet. Use "Plan ahead" to add recurring bills or income.
          </Text>
        </View>
      ) : null}

      <Button
        className="mt-4 h-11 self-start rounded-full bg-[#131b17] px-5"
        variant="ghost"
        size="sm"
        onPress={onOpenRecurring}>
        <Text className="text-sm font-semibold text-[#dce2de]">View all</Text>
        <Icon as={ArrowUpRightIcon} className="ml-1.5 size-4 text-[#8bff62]" />
      </Button>
    </View>
  );
}

export function BudgetsSection({
  isLoading,
  budgets,
  transactions,
  onOpenBudgets,
}: {
  isLoading: boolean;
  budgets: Budget[];
  transactions: Transaction[];
  onOpenBudgets: () => void;
}) {
  return (
    <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-[28px] font-semibold text-[#f4f7f5]">Budgets</Text>
          <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
            Track spending limits and catch drift early.
          </Text>
        </View>
        <View className="size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Icon as={TargetIcon} className="size-5 text-[#ffc857]" />
        </View>
      </View>

      {isLoading ? (
        <View className="mt-5 rounded-[24px] bg-[#131b17] p-4">
          <Text className="text-sm leading-6 text-[#7f8c86]">Loading budgets…</Text>
        </View>
      ) : null}

      {!isLoading && budgets.length > 0 ? (
        <View className="mt-5 gap-3">
          {budgets.slice(0, 3).map((budget) => {
            const spent = getSpentForBudget(budget, transactions);
            const limit = Number(budget.amount);
            const remaining = limit - spent;
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOver = spent > limit;
            const isWarning = pct >= budget.alertThreshold;
            const barColor = isOver ? '#ff8a94' : isWarning ? '#ffc857' : '#8bff62';

            return (
              <Pressable
                key={budget.id}
                className="rounded-[24px] bg-[#131b17] p-4"
                onPress={onOpenBudgets}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-[#f4f7f5]" numberOfLines={1}>
                      {budget.name || 'Unnamed budget'}
                    </Text>
                    <Text className="mt-1 text-xs text-[#7f8c86]">
                      {formatCurrency(spent, budget.currency)} of{' '}
                      {formatCurrency(limit, budget.currency)}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm font-semibold ${remaining < 0 ? 'text-[#ff8a94]' : 'text-[#dce2de]'}`}>
                    {remaining < 0 ? 'Over' : 'Left'}{' '}
                    {formatCurrency(Math.abs(remaining), budget.currency)}
                  </Text>
                </View>
                <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#1a2c1f]">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {!isLoading && budgets.length === 0 ? (
        <View className="mt-5 rounded-[24px] bg-[#131b17] p-4">
          <Text className="text-sm leading-6 text-[#7f8c86]">
            Set a budget to start tracking category drift and remaining room.
          </Text>
        </View>
      ) : null}

      <Button
        className="mt-4 h-11 self-start rounded-full bg-[#131b17] px-5"
        variant="ghost"
        size="sm"
        onPress={onOpenBudgets}>
        <Text className="text-sm font-semibold text-[#dce2de]">View all</Text>
        <Icon as={ArrowUpRightIcon} className="ml-1.5 size-4 text-[#ffc857]" />
      </Button>
    </View>
  );
}
