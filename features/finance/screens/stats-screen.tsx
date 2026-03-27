import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import {
  ExpenseDonut,
  SmartInsightsCard,
  StatTile,
} from '@/features/finance/components/stats-sections';
import { Text } from '@/components/ui/text';
import {
  generatePenniHomeSummary,
  getAppleIntelligenceAvailability,
  supportsAppleIntelligenceSummary,
} from '@/features/ai/lib/apple-intelligence';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { usePlannedItemsQuery } from '@/features/finance/hooks/use-planned-items-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { formatCurrency } from '@/features/finance/lib/formatters';
import { buildMonthlyExpenseDistribution } from '@/features/finance/lib/selectors';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIcon,
  ChartColumnBigIcon,
  CircleDollarSignIcon,
  TargetIcon,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

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
    if (!appleAISupported || !transactionsQuery.isSuccess || !plannedItemsQuery.isSuccess || isGeneratingSummary) {
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
  } = useMemo(
    () => buildMonthlyExpenseDistribution(transactions, expenseCategories),
    [expenseCategories, transactions],
  );

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
                <StatTile key={tile.label} {...tile} />
              ))}
            </View>
            <View className="flex-row gap-4">
              {statTiles.slice(2).map((tile) => (
                <StatTile key={tile.label} {...tile} />
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
                        <View className="size-3 rounded-full" style={{ backgroundColor: row.colorHex ?? '#7f8c86' }} />
                        <Text className="flex-1 text-[16px] font-semibold text-[#f4f7f5]" numberOfLines={1}>
                          {row.name}
                        </Text>
                      </View>
                      <Text className="ml-4 text-[15px] font-semibold text-[#dce2de]">{row.share}%</Text>
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

          <SmartInsightsCard
            appleAISupported={appleAISupported}
            appleAIAvailabilityMessage={appleAIAvailabilityMessage}
            isGeneratingSummary={isGeneratingSummary}
            aiSummary={aiSummary}
            aiSummaryError={aiSummaryError}
          />
        </View>
      </ScrollView>

      <AppTabBar currentTab="stats" />
    </View>
  );
}
