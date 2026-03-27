import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { ACCOUNT_TYPE_META, type AccountFilter } from '@/features/finance/lib/constants';
import { formatCurrency, formatDueDayOfMonth } from '@/features/finance/lib/formatters';
import type { Account } from '@/features/finance/lib/finance.types';
import { router } from 'expo-router';
import { PlusIcon, Trash2Icon, WalletIcon } from 'lucide-react-native';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export function AccountSkeletonCard() {
  return (
    <View className="rounded-[24px] border border-[#17211c] bg-[#131b17] p-4">
      <View className="flex-row items-center gap-3">
        <View className="size-11 rounded-full bg-[#1a2620]" />
        <View className="flex-1 gap-2">
          <View className="h-4 w-28 rounded-full bg-[#1a2620]" />
          <View className="h-3 w-20 rounded-full bg-[#162019]" />
        </View>
        <View className="items-end gap-2">
          <View className="h-5 w-24 rounded-full bg-[#1a2620]" />
          <View className="h-3 w-14 rounded-full bg-[#162019]" />
        </View>
      </View>
    </View>
  );
}

export function AccountsEmptyState({ filter }: { filter: AccountFilter }) {
  const filterToType = {
    Debit: 'BANK_ACCOUNT',
    Credit: 'CREDIT_CARD',
    Cash: 'CASH',
    'E-wallet': 'E_WALLET',
    Other: 'OTHER',
  } as const;
  const type = filterToType[filter as keyof typeof filterToType];
  const meta = type ? ACCOUNT_TYPE_META[type] : null;
  const IconComponent = meta?.icon ?? WalletIcon;
  const iconColor = meta?.accentColor ?? '#8bff62';

  return (
    <View className="items-center gap-4 rounded-[24px] bg-[#131b17] px-6 py-10">
      <View className="size-16 items-center justify-center rounded-full bg-[#18221d]">
        <IconComponent color={iconColor} size={28} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-base font-semibold text-[#f4f7f5]">
          No {filter === 'All' ? '' : `${filter.toLowerCase()} `}accounts yet
        </Text>
        <Text className="text-center text-sm leading-5 text-[#7f8c86]">
          Add your first account to start tracking your balances in one place.
        </Text>
      </View>
      <Button className="mt-2 h-11 rounded-full bg-[#8bff62] px-5" variant="ghost" size="sm" onPress={() => router.push('/account-compose')}>
        <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
        <Text className="text-sm font-semibold text-[#07110a]">Add account</Text>
      </Button>
    </View>
  );
}

export function AccountCard({ account }: { account: Account }) {
  const meta = ACCOUNT_TYPE_META[account.type];
  const TypeIcon = meta.icon;
  const isCreditCard = account.type === 'CREDIT_CARD';
  const availableCredit = account.availableCredit ? Number(account.availableCredit) : null;
  const creditLimit = account.creditLimit ? Number(account.creditLimit) : null;
  const dueDayLabel = formatDueDayOfMonth(account.dueDayOfMonth);
  const creditCardDetails = [
    availableCredit !== null ? `Available ${formatCurrency(availableCredit, account.currency)}` : null,
    creditLimit !== null ? `Limit ${formatCurrency(creditLimit, account.currency)}` : null,
    dueDayLabel ? `Due ${dueDayLabel}` : null,
  ]
    .filter(Boolean)
    .join('  •  ');

  return (
    <View className={`h-[138px] overflow-hidden rounded-[24px] border ${meta.cardClassName ?? 'border-[#17211c] bg-[#131b17]'}`}>
      <View className={`h-[3px] ${meta.gradientStripClassName ?? 'bg-[#8bff62]'} opacity-40`} />

      <View className="flex-1 justify-between px-4 pb-4 pt-3">
        <View className="flex-row items-center gap-3">
          <View className={`size-11 items-center justify-center rounded-full ${meta.iconWrapClassName}`}>
            <TypeIcon color="#f4f7f5" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-[#f4f7f5]">{account.name}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Badge
                label={meta.label}
                variant="subtle"
                size="sm"
                className="bg-[#18221d]"
                textClassName={meta.accentTextClassName}
              />
              <Text className="text-xs text-[#6d786f]">{account.currency}</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className={`text-lg font-semibold ${Number(account.balance) < 0 ? 'text-[#ff8a94]' : meta.accentTextClassName}`}>
              {formatCurrency(Number(account.balance), account.currency)}
            </Text>
            {account.institutionName ? <Text className="mt-0.5 text-xs text-[#6d786f]">{account.institutionName}</Text> : null}
          </View>
        </View>

        <View className="mt-3 min-h-[32px] border-t border-white/5 pt-3">
          {isCreditCard && creditCardDetails ? (
            <Text className="text-[13px] font-medium leading-5 text-[#b6c0bb]">{creditCardDetails}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function AccountSwipeableRow({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.6, 0],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
        className="ml-4 items-center justify-center rounded-[24px] bg-[#3d1419] px-6">
        <Animated.View style={{ transform: [{ scale }], opacity }} className="items-center gap-1">
          <Trash2Icon color="#ff8a94" size={20} />
          <Text className="text-[11px] font-semibold text-[#ff8a94]">Delete</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}>
      {children}
    </Swipeable>
  );
}
