import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { ACCOUNT_TYPE_META, type AccountFilter } from '@/features/finance/lib/constants';
import { formatCurrency } from '@/features/finance/lib/formatters';
import type { Account } from '@/features/finance/lib/finance.types';
import { router } from 'expo-router';
import { PlusIcon, Trash2Icon, WalletIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

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

export function AccountCard({
  account,
  isConfirmingDelete,
  isDeleting,
  onDeletePress,
  onCancelDelete,
  onConfirmDelete,
}: {
  account: Account;
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  onDeletePress: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const meta = ACCOUNT_TYPE_META[account.type];
  const TypeIcon = meta.icon;

  return (
    <View className={`overflow-hidden rounded-[24px] border ${meta.cardClassName ?? 'border-[#17211c] bg-[#131b17]'}`}>
      <View className={`h-[3px] ${meta.gradientStripClassName ?? 'bg-[#8bff62]'} opacity-40`} />

      <View className="px-4 pb-4 pt-3">
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

        {isConfirmingDelete ? (
          <View className="mt-3 flex-row items-center justify-end gap-2 border-t border-white/5 pt-3">
            <Text className="flex-1 text-xs font-medium text-[#ffb4bb]">Delete this account?</Text>
            <Pressable className="rounded-full bg-[#131b17] px-3 py-2" onPress={onCancelDelete}>
              <Text className="text-sm font-semibold text-[#dce2de]">Cancel</Text>
            </Pressable>
            <Pressable className="rounded-full bg-[#1d1416] px-3 py-2" disabled={isDeleting} onPress={onConfirmDelete}>
              <View className="flex-row items-center gap-1.5">
                <Trash2Icon color="#ff8a94" size={13} />
                <Text className="text-sm font-semibold text-[#ff8a94]">{isDeleting ? 'Deleting…' : 'Confirm'}</Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable className="mt-3 flex-row items-center justify-end gap-1.5 border-t border-white/5 pt-3" onPress={onDeletePress}>
            <Trash2Icon color="#ff8a94" size={13} />
            <Text className="text-xs font-semibold text-[#ff8a94]">Remove</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
