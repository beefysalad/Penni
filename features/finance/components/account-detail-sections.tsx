import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { ACCOUNT_TYPE_META } from '@/features/finance/lib/constants';
import {
  formatCurrency,
  formatDueDayOfMonth,
} from '@/features/finance/lib/formatters';
import type { Account } from '@/features/finance/lib/finance.types';
import {
  ArrowDownLeftIcon,
  ArrowRightLeftIcon,
  ArrowUpRightIcon,
  CalendarClockIcon,
  PlusIcon,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

function getHeroPalette(type: Account['type']) {
  if (type === 'BANK_ACCOUNT') {
    return {
      surface: 'bg-[#6f788d]',
      glow: 'bg-[#d9dfef]/20',
      accent: 'bg-[#c4ccde]/25',
      border: 'border-[#808aa1]',
    };
  }

  if (type === 'CREDIT_CARD') {
    return {
      surface: 'bg-[#514867]',
      glow: 'bg-[#d8c5ff]/15',
      accent: 'bg-[#8a7ca8]/25',
      border: 'border-[#6a5f83]',
    };
  }

  if (type === 'E_WALLET') {
    return {
      surface: 'bg-[#37546c]',
      glow: 'bg-[#b8e6ff]/15',
      accent: 'bg-[#5a9dff]/20',
      border: 'border-[#486d88]',
    };
  }

  if (type === 'CASH') {
    return {
      surface: 'bg-[#56654a]',
      glow: 'bg-[#dcf5b0]/12',
      accent: 'bg-[#9fdb61]/18',
      border: 'border-[#68785a]',
    };
  }

  return {
    surface: 'bg-[#535a67]',
    glow: 'bg-[#d8dde8]/15',
    accent: 'bg-[#a8b4c6]/18',
    border: 'border-[#687181]',
  };
}

export function AccountOverviewHero({ account }: { account: Account }) {
  const meta = ACCOUNT_TYPE_META[account.type];
  const TypeIcon = meta.icon;
  const palette = getHeroPalette(account.type);
  const isCreditCard = account.type === 'CREDIT_CARD';
  const heroAmount =
    account.type === 'CREDIT_CARD'
      ? formatCurrency(Number(account.creditCard?.availableCredit ?? 0), account.currency)
      : formatCurrency(Number(account.balance), account.currency);

  return (
    <View
      className={`overflow-hidden rounded-[36px] border ${palette.border} ${palette.surface} px-6 pb-7 pt-6`}>
      <View className={`absolute -left-12 top-10 size-48 rounded-full ${palette.glow}`} />
      <View className={`absolute right-10 top-0 size-40 rounded-full ${palette.accent}`} />
      <View className="absolute inset-x-0 top-28 h-16 bg-white/5" />

      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-row items-center gap-4">
          <View className="size-16 items-center justify-center rounded-[22px] bg-white">
            <TypeIcon color={meta.accentColor} size={30} />
          </View>

          <View className="flex-1">
            <Text className="text-[16px] font-semibold text-white/75">
              {account.institutionName || meta.label}
            </Text>
            <Text className="mt-1 text-[22px] font-bold tracking-tight text-white">
              {account.name}
            </Text>
          </View>
        </View>

        <Badge
          label={meta.label}
          variant="subtle"
          size="sm"
          className="bg-black/15"
          textClassName="text-white/80"
        />
      </View>

      <View className="mt-20">
        <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-white/65">
          {isCreditCard ? 'Available credit' : 'Balance'}
        </Text>
        <Text className="mt-2 text-[28px] font-bold tracking-tight text-white">
          {heroAmount}
        </Text>
      </View>
    </View>
  );
}

export function AccountActionPanel({
  account,
  moneyIn,
  moneyOut,
  recurringCount,
  onTransfer,
  onAddExpense,
  onAddIncome,
  onPayCard,
  onPlanAhead,
}: {
  account: Account;
  moneyIn: number;
  moneyOut: number;
  recurringCount: number;
  onTransfer: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onPayCard: () => void;
  onPlanAhead: () => void;
}) {
  const isCreditCard = account.type === 'CREDIT_CARD';
  const balance = Number(account.balance);
  const availableCredit = Number(account.creditCard?.availableCredit ?? 0);
  const creditLimit = Number(account.creditCard?.creditLimit ?? 0);
  const usedCredit = Math.max(0, creditLimit - availableCredit);
  const dueDayOfMonth = account.creditCard?.dueDayOfMonth ?? null;
  const statementDayOfMonth = account.creditCard?.statementDayOfMonth ?? null;

  return (
    <View className="rounded-[34px] border border-[#1b2a21] bg-[#111916] p-5">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
            {isCreditCard ? 'Used credit' : 'Net balance'}
          </Text>
          <Text
            className="mt-2 text-[24px] font-bold tracking-tight text-white"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}>
            {formatCurrency(isCreditCard ? usedCredit : balance, account.currency)}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
            {isCreditCard ? 'Available' : 'Spendable'}
          </Text>
          <Text
            className="mt-2 text-[24px] font-bold tracking-tight text-white"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}>
            {formatCurrency(isCreditCard ? availableCredit : balance, account.currency)}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row gap-3">
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#1f3725] px-4 py-4"
          onPress={isCreditCard ? onPayCard : onTransfer}>
          <ArrowRightLeftIcon color="#7dbd78" size={20} />
          <Text className="text-[16px] font-semibold text-[#7dbd78]">
            {isCreditCard ? 'Pay card' : 'Transfer'}
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#17221b] px-4 py-4"
          onPress={onPlanAhead}>
          <CalendarClockIcon color="#7dbd78" size={20} />
          <Text className="text-[16px] font-semibold text-[#7dbd78]">
            {isCreditCard ? 'Plan card' : 'Recurring'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-3 flex-row gap-3">
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#4a2020] px-4 py-4"
          onPress={onAddExpense}>
          <ArrowDownLeftIcon color="#ef8c8c" size={20} />
          <Text className="text-[16px] font-semibold text-[#ef8c8c]">
            {isCreditCard ? 'Add charge' : 'Add expense'}
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#203323] px-4 py-4"
          onPress={onAddIncome}>
          <ArrowUpRightIcon color="#7dbd78" size={20} />
          <Text className="text-[16px] font-semibold text-[#7dbd78]">
            {isCreditCard ? 'Add credit' : 'Add income'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-4 rounded-[26px] bg-[#0b0f0d] px-4 py-4">
        {isCreditCard ? (
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-[18px] bg-[#111916] px-4 py-3">
                <Text className="text-[10px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Limit
                </Text>
                <Text className="mt-1 text-[16px] font-semibold text-[#f4f7f5]">
                  {formatCurrency(creditLimit, account.currency)}
                </Text>
              </View>

              <View className="flex-1 rounded-[18px] bg-[#111916] px-4 py-3">
                <Text className="text-[10px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Statement
                </Text>
                <Text className="mt-1 text-[16px] font-semibold text-[#9dd6ff]">
                  {statementDayOfMonth
                    ? formatDueDayOfMonth(statementDayOfMonth)
                    : 'Not set'}
                </Text>
              </View>
            </View>

            <View className="rounded-[18px] bg-[#111916] px-4 py-3">
              <Text className="text-[10px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
                Due day
              </Text>
              <Text className="mt-1 text-[16px] font-semibold text-[#ffc857]">
                {dueDayOfMonth ? formatDueDayOfMonth(dueDayOfMonth) : 'Not set'}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[88px] flex-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
                Money in
              </Text>
              <Text className="mt-2 text-[18px] font-semibold text-[#41d6b2]">
                {formatCurrency(moneyIn, account.currency)}
              </Text>
            </View>

            <View className="min-w-[88px] flex-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
                Money out
              </Text>
              <Text className="mt-2 text-[18px] font-semibold text-[#ff8a94]">
                {formatCurrency(moneyOut, account.currency)}
              </Text>
            </View>

            <View className="min-w-[88px] flex-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[1.8px] text-[#5f6c65]">
                Recurring
              </Text>
              <Text className="mt-2 text-[18px] font-semibold text-white">
                {recurringCount}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
