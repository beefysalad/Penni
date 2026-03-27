import { NativeModules, Platform } from 'react-native';
import type { PlannedItem, Transaction } from '@/features/finance/lib/finance.types';
import { formatRecurrencePhrase } from '@/features/finance/lib/formatters';

type PenniAIModule = {
  getAvailability: () => Promise<{
    isAvailable: boolean;
    reason: string;
    message: string;
  }>;
  generateSummary: (prompt: string) => Promise<string>;
};

const nativeModule = NativeModules.PenniAI as PenniAIModule | undefined;

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function supportsAppleIntelligenceSummary() {
  return Platform.OS === 'ios' && !!nativeModule;
}

export async function getAppleIntelligenceAvailability() {
  if (!nativeModule || Platform.OS !== 'ios') {
    return {
      isAvailable: false,
      reason: 'unsupported_platform',
      message: 'Apple Intelligence summaries are only available on iOS.',
    };
  }

  return nativeModule.getAvailability();
}

export async function generateAppleIntelligenceText(prompt: string) {
  if (!nativeModule || Platform.OS !== 'ios') {
    throw new Error('Apple Intelligence is only available on iOS.');
  }

  return nativeModule.generateSummary(prompt);
}

export async function generatePenniHomeSummary(input: {
  transactions: Transaction[];
  plannedItems: PlannedItem[];
}) {
  if (!nativeModule || Platform.OS !== 'ios') {
    throw new Error('Apple Intelligence summaries are only available on iOS.');
  }

  const recentTransactions = input.transactions.slice(0, 6);
  const upcomingItems = input.plannedItems.slice(0, 6);

  const transactionsText =
    recentTransactions.length > 0
      ? recentTransactions
          .map((transaction) => {
            const sign = transaction.type === 'EXPENSE' ? '-' : '+';
            return `${transaction.type}: ${transaction.title}, ${sign}${formatCurrency(
              Number(transaction.amount),
              transaction.currency,
            )}, ${formatDate(transaction.transactionAt)}.`;
          })
          .join(' ')
      : 'No recent transactions.';

  const plannedItemsText =
    upcomingItems.length > 0
      ? upcomingItems
          .map((item) => {
            const when = item.nextOccurrenceAt ?? item.startDate;
            return `${item.type}: ${item.title}, ${formatCurrency(
              Number(item.amount),
              item.currency,
            )}, ${formatRecurrencePhrase(item.recurrence, item.semiMonthlyDays)}, next ${formatDate(when)}.`;
          })
          .join(' ')
      : 'No upcoming planned items.';

  const prompt = `
You are Penni, a calm fintech assistant.
Write exactly 3 short sentences.
Keep the total under 65 words.
Sound like a product insight, not a report.
Do not use headings, bullet points, lists, labels, markdown, or asterisks.
Do not repeat every transaction.
Do not say "recent transactions" or "upcoming recurring items".
Do not give financial advice, direct instructions, or commands.
The second sentence may include a gentle behavioral nudge, but it must stay descriptive and soft.
Use language like "this week may feel tighter", "things look heavier than usual", or "the next few days may be worth keeping light".
Do not say "you should", "you need to", "make sure to", or "stop spending".
Focus on:
1. the clearest pattern in the latest money movement
2. the most relevant upcoming recurring item if one exists

Data:
${transactionsText}
${plannedItemsText}
`.trim();

  const rawSummary = await generateAppleIntelligenceText(prompt);

  return rawSummary
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(Here'?s a summary of .*?:\s*)/i, '')
    .replace(/Recent Transactions:\s*/gi, '')
    .replace(/Upcoming Recurring (Expenses|Items):\s*/gi, '')
    .trim();
}
