import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  generatePenniHomeSummary,
  getAppleIntelligenceAvailability,
  supportsAppleIntelligenceSummary,
} from '@/features/ai/lib/apple-intelligence';
import { usePlannedItemsQuery } from '@/features/finance/hooks/use-planned-items-query';
import { useTransactionsQuery } from '@/features/finance/hooks/use-transactions-query';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SparklesIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function InsightsScreen() {
  const transactionsQuery = useTransactionsQuery();
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true });

  const allTransactions = transactionsQuery.data ?? [];
  const recentTransactions = allTransactions.slice(0, 5);
  const plannedItems = (plannedItemsQuery.data ?? []).slice(0, 5);

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
        setAppleAIAvailabilityMessage('Apple Intelligence summaries are only available on iOS 18.1+.');
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
    if (!transactionsQuery.isSuccess || !plannedItemsQuery.isSuccess) return;

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

    if (!appleAISupported) {
      return;
    }

    if (isGeneratingSummary) {
      return;
    }

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
    recentTransactions,
    transactionsQuery.isSuccess,
    plannedItemsQuery.isSuccess,
  ]);

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
            eyebrow="Penni AI"
            title="Smart Insights"
            subtitle="Your financial data summarized securely on-device using Apple Intelligence."
            inverted
          />
        </View>

        <View className="px-6 pt-6">
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
                  <Text className="mt-3 text-[16px] leading-7 text-[#eef3ef]">
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
    </View>
  );
}
