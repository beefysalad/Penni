import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Badge } from '@/components/ui/pill';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { SearchInput } from '@/components/ui/search-input';
import { Text } from '@/components/ui/text';
import { useAccountsQuery, useDeleteAccountMutation } from '@/features/finance/hooks/use-accounts-query';
import type { Account, AccountType } from '@/features/finance/lib/finance.types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  CalendarClockIcon,
  CreditCardIcon,
  LandmarkIcon,
  PlusIcon,
  SmartphoneIcon,
  Trash2Icon,
  TrendingUpIcon,
  WalletIcon,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

// ─── Per-type metadata ────────────────────────────────────────────────────────

const ACCOUNT_TYPE_META: Record<
  AccountType,
  {
    label: string;
    icon: typeof CreditCardIcon;
    iconWrapClassName: string;
    cardClassName: string;
    accentTextClassName: string;
    accentColor: string;
    gradientStripClassName: string;
  }
> = {
  CASH: {
    label: 'Cash',
    icon: BanknoteIcon,
    iconWrapClassName: 'bg-[#173223]',
    cardClassName: 'border-[#1a2620] bg-[#111816]',
    accentTextClassName: 'text-[#41d6b2]',
    accentColor: '#41d6b2',
    gradientStripClassName: 'bg-[#41d6b2]',
  },
  BANK_ACCOUNT: {
    label: 'Debit',
    icon: LandmarkIcon,
    iconWrapClassName: 'bg-[#1a2c1f]',
    cardClassName: 'border-[#1b2a21] bg-[#121a16]',
    accentTextClassName: 'text-[#8bff62]',
    accentColor: '#8bff62',
    gradientStripClassName: 'bg-[#8bff62]',
  },
  E_WALLET: {
    label: 'E-wallet',
    icon: SmartphoneIcon,
    iconWrapClassName: 'bg-[#1a262d]',
    cardClassName: 'border-[#1b252b] bg-[#12191d]',
    accentTextClassName: 'text-[#5aa9ff]',
    accentColor: '#5aa9ff',
    gradientStripClassName: 'bg-[#5aa9ff]',
  },
  CREDIT_CARD: {
    label: 'Credit',
    icon: CreditCardIcon,
    iconWrapClassName: 'bg-[#231b33]',
    cardClassName: 'border-[#241e2d] bg-[#171320]',
    accentTextClassName: 'text-[#ffc857]',
    accentColor: '#ffc857',
    gradientStripClassName: 'bg-[#ffc857]',
  },
  OTHER: {
    label: 'Other',
    icon: WalletIcon,
    iconWrapClassName: 'bg-[#202018]',
    cardClassName: 'border-[#26261c] bg-[#181814]',
    accentTextClassName: 'text-[#d8ff5b]',
    accentColor: '#d8ff5b',
    gradientStripClassName: 'bg-[#d8ff5b]',
  },
};

const ACCOUNT_FILTERS = ['All', 'Debit', 'Credit', 'Cash', 'E-wallet', 'Other'] as const;
type AccountFilter = (typeof ACCOUNT_FILTERS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;

  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function getTypeBreakdown(accounts: Account[]) {
  const map = new Map<AccountType, number>();

  for (const account of accounts) {
    map.set(account.type, (map.get(account.type) ?? 0) + Number(account.balance));
  }

  return Array.from(map.entries())
    .filter(([, balance]) => balance !== 0)
    .sort(([, a], [, b]) => b - a);
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: AccountFilter }) {
  const filterToType: Partial<Record<AccountFilter, AccountType>> = {
    Debit: 'BANK_ACCOUNT',
    Credit: 'CREDIT_CARD',
    Cash: 'CASH',
    'E-wallet': 'E_WALLET',
    Other: 'OTHER',
  };
  const type = filterToType[filter];
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
      <Button
        className="mt-2 h-11 rounded-full bg-[#8bff62] px-5"
        variant="ghost"
        size="sm"
        onPress={() => router.push('/account-compose')}>
        <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
        <Text className="text-sm font-semibold text-[#07110a]">Add account</Text>
      </Button>
    </View>
  );
}

// ─── Account card ─────────────────────────────────────────────────────────────

function AccountCard({
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
    <View className={`overflow-hidden rounded-[24px] border ${meta.cardClassName}`}>
      {/* Accent strip */}
      <View className={`h-[3px] ${meta.gradientStripClassName} opacity-40`} />

      <View className="px-4 pb-4 pt-3">
        <View className="flex-row items-center gap-3">
          {/* Type icon */}
          <View className={`size-11 items-center justify-center rounded-full ${meta.iconWrapClassName}`}>
            <TypeIcon color="#f4f7f5" size={20} />
          </View>

          {/* Name and type */}
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

          {/* Balance — prominent right side */}
          <View className="items-end">
            <Text className={`text-lg font-semibold ${Number(account.balance) < 0 ? 'text-[#ff8a94]' : meta.accentTextClassName}`}>
              {formatCurrency(Number(account.balance), account.currency)}
            </Text>
            {account.institutionName ? (
              <Text className="mt-0.5 text-xs text-[#6d786f]">{account.institutionName}</Text>
            ) : null}
          </View>
        </View>

        {/* Delete row */}
        {isConfirmingDelete ? (
          <View className="mt-3 flex-row items-center justify-end gap-2 border-t border-white/5 pt-3">
            <Text className="flex-1 text-xs font-medium text-[#ffb4bb]">
              Delete this account?
            </Text>
            <Pressable
              className="rounded-full bg-[#131b17] px-3 py-2"
              onPress={onCancelDelete}>
              <Text className="text-sm font-semibold text-[#dce2de]">Cancel</Text>
            </Pressable>
            <Pressable
              className="rounded-full bg-[#1d1416] px-3 py-2"
              disabled={isDeleting}
              onPress={onConfirmDelete}>
              <View className="flex-row items-center gap-1.5">
                <Trash2Icon color="#ff8a94" size={13} />
                <Text className="text-sm font-semibold text-[#ff8a94]">
                  {isDeleting ? 'Deleting…' : 'Confirm'}
                </Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="mt-3 flex-row items-center justify-end gap-1.5 border-t border-white/5 pt-3"
            onPress={onDeletePress}>
            <Trash2Icon color="#ff8a94" size={13} />
            <Text className="text-xs font-semibold text-[#ff8a94]">Remove</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AccountsScreen() {
  const accountsQuery = useAccountsQuery();
  const deleteAccountMutation = useDeleteAccountMutation();
  const accounts = accountsQuery.data ?? [];
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('All');
  const [search, setSearch] = useState('');
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const typeBreakdown = useMemo(() => getTypeBreakdown(accounts), [accounts]);

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const meta = ACCOUNT_TYPE_META[account.type];
      const matchesFilter = activeFilter === 'All' || meta.label === activeFilter;
      const matchesSearch =
        !q || `${account.name} ${account.currency} ${meta.label}`.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [accounts, activeFilter, search]);

  const visibleAccounts = showAllAccounts ? filteredAccounts : filteredAccounts.slice(0, 8);



  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Wallets and balances"
            title="See all your money in one place"
            subtitle="Track cash, bank balances, and cards without switching between apps."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          {/* ─── Net-worth hero card ───────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#7f8c86]">Net worth</Text>
                <Text className="mt-1 text-[34px] font-semibold tracking-[-1px] text-[#f4f7f5]">
                  {formatCurrency(totalBalance)}
                </Text>
              </View>
              <View className="size-12 items-center justify-center rounded-full bg-[#1a2c1f]">
                <Icon as={TrendingUpIcon} className="size-5 text-[#8bff62]" />
              </View>
            </View>

            {/* Type breakdown pills */}
            {typeBreakdown.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pt-4">
                {typeBreakdown.map(([type, balance]) => {
                  const meta = ACCOUNT_TYPE_META[type];
                  const TypeIcon = meta.icon;

                  return (
                    <View
                      key={type}
                      className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3 py-2">
                      <TypeIcon color={meta.accentColor} size={13} />
                      <Text className={`text-xs font-semibold ${meta.accentTextClassName}`}>
                        {meta.label}
                      </Text>
                      <Text className="text-xs text-[#7f8c86]">
                        {formatCurrency(balance)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}

            {/* Quick actions */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pt-4">
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#1d1518] px-3.5 py-2"
                onPress={() => router.push('/transaction-compose?type=EXPENSE')}>
                <ArrowDownLeftIcon color="#ff8a94" size={13} />
                <Text className="text-xs font-semibold text-[#ff8a94]">Add expense</Text>
              </Pressable>
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#16211b] px-3.5 py-2"
                onPress={() => router.push('/transaction-compose?type=INCOME')}>
                <ArrowUpRightIcon color="#41d6b2" size={13} />
                <Text className="text-xs font-semibold text-[#41d6b2]">Add income</Text>
              </Pressable>
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2"
                onPress={() => router.push('/plan-ahead')}>
                <CalendarClockIcon color="#8bff62" size={13} />
                <Text className="text-xs font-semibold text-[#93a19a]">Plan ahead</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* ─── Accounts section ──────────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="gap-4">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-[28px] font-semibold text-[#f4f7f5]">Accounts</Text>
                  <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                    Manage your wallets and balances.
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3">
                <Button
                  className="h-12 flex-1 rounded-full bg-[#8bff62] px-5"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push('/account-compose')}>
                  <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
                  <Text className="text-sm font-semibold text-[#07110a]">Add account</Text>
                </Button>
                <Pressable
                  className="flex-1 rounded-full bg-[#131b17] px-5 py-3"
                  onPress={() => router.push('/account-compose?type=CASH&name=Cash')}>
                  <View className="flex-row items-center justify-center gap-2">
                    <BanknoteIcon color="#41d6b2" size={16} />
                    <Text className="text-sm font-semibold text-[#dce2de]">Cash on hand</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* ─── Horizontal filter pills ──────────────────────────────────── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pt-5">
              {ACCOUNT_FILTERS.map((filter) => {
                const isActive = filter === activeFilter;

                return (
                  <Pill
                    key={filter}
                    label={filter}
                    variant={isActive ? 'selected' : 'default'}
                    size="md"
                    onPress={() => setActiveFilter(filter)}
                  />
                );
              })}
            </ScrollView>

            {/* ─── Search ───────────────────────────────────────────────────── */}
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search accounts"
              className="mt-4"
            />

            {/* ─── Account list ─────────────────────────────────────────────── */}
            <View className="mt-4 gap-3">
              {accountsQuery.isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : null}

              {!accountsQuery.isLoading && visibleAccounts.length > 0
                ? visibleAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      isConfirmingDelete={confirmingDeleteId === account.id}
                      isDeleting={deleteAccountMutation.isPending}
                      onDeletePress={() => setConfirmingDeleteId(account.id)}
                      onCancelDelete={() => setConfirmingDeleteId(null)}
                      onConfirmDelete={async () => {
                        await deleteAccountMutation.mutateAsync(account.id);
                        setConfirmingDeleteId(null);
                      }}
                    />
                  ))
                : null}

              {!accountsQuery.isLoading && filteredAccounts.length > 8 ? (
                <Pill
                  label={
                    showAllAccounts
                      ? 'Show fewer accounts'
                      : `Show all ${filteredAccounts.length} accounts`
                  }
                  variant="subtle"
                  size="md"
                  className="self-start"
                  onPress={() => setShowAllAccounts((c) => !c)}
                />
              ) : null}

              {!accountsQuery.isLoading && filteredAccounts.length === 0 ? (
                <EmptyState filter={activeFilter} />
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="accounts" />
    </View>
  );
}
