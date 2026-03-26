import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  generatePenniHomeSummary,
  getAppleIntelligenceAvailability,
  supportsAppleIntelligenceSummary,
} from '@/features/ai/lib/apple-intelligence';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { usePlannedItemsQuery } from '@/features/finance/hooks/use-planned-items-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIcon,
  ChartColumnBigIcon,
  CircleDollarSignIcon,
  SparklesIcon,
  TargetIcon,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getMonthBounds() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

function ExpenseDonut({
  rows,
  total,
}: {
  rows: Array<{ colorHex: string | null; amount: number }>;
  total: number;
}) {
  const size = 184;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#17211c"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {rows.map((row, index) => {
          const dash = total > 0 ? (row.amount / total) * circumference : 0;
          const circle = (
            <Circle
              key={`${row.colorHex ?? '#7f8c86'}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={row.colorHex ?? '#7f8c86'}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
          offset += dash;
          return circle;
        })}
      </Svg>
      <View className="absolute items-center">
        <Text className="text-[32px] font-semibold tracking-[-1px] text-[#f4f7f5]">
          {rows[0]?.amount && total > 0 ? `${Math.round((rows[0].amount / total) * 100)}%` : '0%'}
        </Text>
        <Text className="mt-1 text-sm text-[#7f8c86]">
          {rows[0]?.amount ? 'Top share' : 'No spend'}
        </Text>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const transactionsQuery = useTransactionsQuery();
  const expenseCategoriesQuery = useCategoriesQuery({ type: 'EXPENSE' });
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true });

  const transactions = transactionsQuery.data ?? [];
  const expenseCategories = expenseCategoriesQuery.data ?? [];
  const plannedItems = (plannedItemsQuery.data ?? []).slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);
  const [appleAISupported, setAppleAISupported] = useState(false);
  const [appleAIAvailabilityMessage, setAppleAIAvailabilityMessage] = useState(
    'Checking Apple Intelligence availability…',
  );
  const lastInsightKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAppleAIAvailability() {
      if (!supportsAppleIntelligenceSummary()) {
        if (!isMounted) return;
        setAppleAISupported(false);
        setAppleAIAvailabilityMessage('Apple Intelligence summaries are only available on iOS.');
        return;
      }

      try {
        const availability = await getAppleIntelligenceAvailability();
        if (!isMounted) return;
        setAppleAISupported(availability.isAvailable);
        setAppleAIAvailabilityMessage(availability.message);
      } catch {
        if (!isMounted) return;
        setAppleAISupported(false);
        setAppleAIAvailabilityMessage('Unable to determine Apple Intelligence availability.');
      }
    }

    loadAppleAIAvailability();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!appleAISupported) {
      return;
    }

    if (!transactionsQuery.isSuccess || !plannedItemsQuery.isSuccess) {
      return;
    }

    if (isGeneratingSummary) {
      return;
    }

    const insightKey = JSON.stringify({
      tx: recentTransactions.map((item) => ({
        id: item.id,
        amount: item.amount,
        type: item.type,
        at: item.transactionAt,
      })),
      planned: plannedItems.map((item) => ({
        id: item.id,
        amount: item.amount,
        type: item.type,
        next: item.nextOccurrenceAt ?? item.startDate,
      })),
    });

    if (lastInsightKeyRef.current === insightKey) {
      return;
    }

    lastInsightKeyRef.current = insightKey;

    async function generateInsight() {
      try {
        setIsGeneratingSummary(true);
        setAiSummaryError(null);
        const summary = await generatePenniHomeSummary({
          transactions: recentTransactions,
          plannedItems,
        });
        setAiSummary(summary);
      } catch (error) {
        setAiSummaryError(
          error instanceof Error ? error.message : 'Unable to generate Apple Intelligence summary.',
        );
      } finally {
        setIsGeneratingSummary(false);
      }
    }

    generateInsight();
  }, [
    appleAISupported,
    isGeneratingSummary,
    plannedItems,
    plannedItemsQuery.isSuccess,
    recentTransactions,
    transactionsQuery.isSuccess,
  ]);

  const {
    monthExpenses,
    monthIncome,
    topCategoryName,
    topCategoryAmount,
    topCategoryShare,
    distributionRows,
  } = useMemo(() => {
    const { year, month } = getMonthBounds();

    const monthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.transactionAt);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === 'EXPENSE');
    const incomeTransactions = monthTransactions.filter((transaction) => transaction.type === 'INCOME');

    const monthExpenses = expenseTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );
    const monthIncome = incomeTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );

    const categoryMap = new Map(expenseCategories.map((category) => [category.id, category]));
    const grouped = new Map<
      string,
      {
        id: string;
        name: string;
        colorHex: string | null;
        amount: number;
      }
    >();

    for (const transaction of expenseTransactions) {
      const categoryId = transaction.categoryId ?? 'uncategorized';
      const category = transaction.categoryId ? categoryMap.get(transaction.categoryId) : null;
      const current = grouped.get(categoryId);
      const nextAmount = Number(transaction.amount);

      grouped.set(categoryId, {
        id: categoryId,
        name: category?.name ?? 'Uncategorized',
        colorHex: category?.colorHex ?? '#7f8c86',
        amount: (current?.amount ?? 0) + nextAmount,
      });
    }

    const distributionRows = Array.from(grouped.values())
      .sort((a, b) => b.amount - a.amount)
      .map((row) => ({
        ...row,
        share: monthExpenses > 0 ? Math.round((row.amount / monthExpenses) * 100) : 0,
      }));

    const topCategory = distributionRows[0];

    return {
      monthExpenses,
      monthIncome,
      topCategoryName: topCategory?.name ?? 'No category yet',
      topCategoryAmount: topCategory?.amount ?? 0,
      topCategoryShare: topCategory?.share ?? 0,
      distributionRows,
    };
  }, [expenseCategories, transactions]);

  const netCashFlow = monthIncome - monthExpenses;

  const statTiles = [
    {
      label: 'Spend pace',
      value: monthExpenses > 0 ? formatCurrency(monthExpenses) : 'No spend yet',
      hint: 'This month',
      icon: ActivityIcon,
      color: '#8bff62',
    },
    {
      label: 'Top category',
      value: topCategoryName,
      hint: topCategoryAmount > 0 ? `${topCategoryShare}% of spending` : 'Waiting on expenses',
      icon: ChartColumnBigIcon,
      color: '#5aa9ff',
    },
    {
      label: 'Net cash flow',
      value:
        monthIncome > 0 || monthExpenses > 0
          ? `${netCashFlow >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netCashFlow))}`
          : 'No movement yet',
      hint: 'Income vs spending',
      icon: CircleDollarSignIcon,
      color: '#41d6b2',
    },
    {
      label: 'Budget drift',
      value: 'Soon',
      hint: 'Budget tracking comes next',
      icon: TargetIcon,
      color: '#ffc857',
    },
  ] as const;

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Monthly trends"
            title="Statistics"
            subtitle="See how your money is moving with quick summaries and category breakdowns."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="gap-4">
            <View className="flex-row gap-4">
              {statTiles.slice(0, 2).map((tile) => (
                <View key={tile.label} className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
                  <View className="size-11 items-center justify-center rounded-full bg-[#131b17]">
                    <Icon as={tile.icon} className="size-5" color={tile.color} />
                  </View>
                  <Text className="mt-4 text-xs font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                    {tile.label}
                  </Text>
                  <Text className="mt-3 text-[17px] font-semibold leading-6 text-[#f4f7f5]">
                    {tile.value}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-[#7f8c86]">{tile.hint}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-4">
              {statTiles.slice(2).map((tile) => (
                <View key={tile.label} className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
                  <View className="size-11 items-center justify-center rounded-full bg-[#131b17]">
                    <Icon as={tile.icon} className="size-5" color={tile.color} />
                  </View>
                  <Text className="mt-4 text-xs font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                    {tile.label}
                  </Text>
                  <Text className="mt-3 text-[17px] font-semibold leading-6 text-[#f4f7f5]">
                    {tile.value}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-[#7f8c86]">{tile.hint}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-[28px] font-semibold text-[#f4f7f5]">Expense distribution</Text>
            <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
              Where your money is landing across categories this month.
            </Text>

            {transactionsQuery.isLoading || expenseCategoriesQuery.isLoading ? (
              <View className="mt-6 rounded-[24px] bg-[#121916] p-4">
                <Text className="text-sm leading-6 text-[#7f8c86]">Loading distribution…</Text>
              </View>
            ) : distributionRows.length > 0 ? (
              <View className="mt-6 gap-5">
                <View className="items-center rounded-[24px] bg-[#121916] px-4 py-5">
                  <ExpenseDonut rows={distributionRows.slice(0, 6)} total={monthExpenses} />
                </View>
                <View className="gap-3">
                  {distributionRows.slice(0, 6).map((row) => (
                    <View
                      key={row.id}
                      className="flex-row items-center justify-between rounded-[20px] bg-[#121916] px-4 py-3.5">
                      <View className="min-w-0 flex-1 flex-row items-center gap-3">
                        <View
                          className="size-3 rounded-full"
                          style={{ backgroundColor: row.colorHex ?? '#7f8c86' }}
                        />
                        <Text className="flex-1 text-[16px] font-semibold text-[#f4f7f5]" numberOfLines={1}>
                          {row.name}
                        </Text>
                      </View>
                      <Text className="ml-4 text-[15px] font-semibold text-[#dce2de]">
                        {row.share}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View className="mt-6 rounded-[24px] bg-[#121916] p-4">
                <Text className="text-sm leading-6 text-[#7f8c86]">
                  Log a few expense transactions first and Penni will break down where your month is going.
                </Text>
              </View>
            )}
          </View>

          <View className="rounded-[30px] border border-[#203326] bg-[#0d1511] p-6 shadow-xl shadow-[#8bff62]/5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View className="size-10 items-center justify-center rounded-[14px] border border-[#203326] bg-[#16231b]">
                  <Icon as={SparklesIcon} className="size-4 text-[#8bff62]" />
                </View>
                <Text className="text-[20px] font-semibold tracking-[-0.5px] text-[#f4f7f5]">
                  Penni AI
                </Text>
              </View>
              {appleAISupported ? (
                <View className="flex-row items-center gap-1.5 rounded-full border border-[#1a2c1f] bg-[#111c16] px-2.5 py-1">
                  <View className="size-1.5 rounded-full bg-[#8bff62] opacity-80" />
                  <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#8bff62]">
                    Active
                  </Text>
                </View>
              ) : null}
            </View>

            <Text className="mb-5 text-[14px] leading-5 text-[#95a39c]">
              {appleAISupported
                ? 'Your personalized financial summary powered by on-device Apple Intelligence.'
                : 'Apple Intelligence is optional. Penni will still work normally without it.'}
            </Text>

            <View className="rounded-[24px] border border-[#17241b] bg-[#111916] p-5 shadow-sm shadow-black/20">
              {aiSummary ? (
                <View>
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#8bff62]">
                    Latest read
                  </Text>
                  <Text className="mt-3 text-[15px] leading-7 text-[#eef3ef]">
                    {aiSummary}
                  </Text>
                </View>
              ) : isGeneratingSummary ? (
                <View className="flex-row items-start gap-3">
                  <View className="mt-1.5 size-2 rounded-full bg-[#ffc857]" />
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#ffc857]">
                      Thinking
                    </Text>
                    <Text className="mt-2 text-[15px] leading-7 text-[#95a39c]">
                      Penni is reading the latest movement on this device...
                    </Text>
                  </View>
                </View>
              ) : aiSummaryError ? (
                <View className="flex-row items-start gap-3">
                  <View className="mt-1.5 size-2 rounded-full bg-[#ff8a94]" />
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#ff8a94]">
                      Unavailable
                    </Text>
                    <Text className="mt-2 text-[14px] leading-6 text-[#ff8a94]">
                      {aiSummaryError}
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#6d786f]">
                    Status
                  </Text>
                  <Text className="mt-3 text-[14px] leading-6 text-[#95a39c]">
                    {appleAISupported
                      ? 'Your latest insight will appear here automatically.'
                      : appleAIAvailabilityMessage}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="stats" />
    </View>
  );
}
