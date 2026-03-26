import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { useAccountsQuery, useDeleteAccountMutation } from '@/features/finance/hooks/use-accounts-query';
import type { AccountType } from '@/features/finance/lib/finance.types';
import type { TriggerRef } from '@rn-primitives/popover';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BanknoteIcon, ChevronDownIcon, CreditCardIcon, PlusIcon, SearchIcon, Trash2Icon, TrendingUpIcon } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

const ACCOUNT_TYPE_META: Record<
  AccountType,
  {
    label: string;
    iconWrapClassName: string;
    cardClassName: string;
    accentTextClassName: string;
  }
> = {
  CASH: {
    label: 'Cash',
    iconWrapClassName: 'bg-[#173223]',
    cardClassName: 'border-[#1a2620] bg-[#111816]',
    accentTextClassName: 'text-[#41d6b2]',
  },
  BANK_ACCOUNT: {
    label: 'Debit',
    iconWrapClassName: 'bg-[#1a2c1f]',
    cardClassName: 'border-[#1b2a21] bg-[#121a16]',
    accentTextClassName: 'text-[#8bff62]',
  },
  E_WALLET: {
    label: 'E-wallet',
    iconWrapClassName: 'bg-[#1a262d]',
    cardClassName: 'border-[#1b252b] bg-[#12191d]',
    accentTextClassName: 'text-[#5aa9ff]',
  },
  CREDIT_CARD: {
    label: 'Credit',
    iconWrapClassName: 'bg-[#231b33]',
    cardClassName: 'border-[#241e2d] bg-[#171320]',
    accentTextClassName: 'text-[#ffc857]',
  },
  OTHER: {
    label: 'Other',
    iconWrapClassName: 'bg-[#202018]',
    cardClassName: 'border-[#26261c] bg-[#181814]',
    accentTextClassName: 'text-[#d8ff5b]',
  },
};

const ACCOUNT_FILTERS = ['All', 'Debit', 'Credit', 'Cash', 'E-wallet'] as const;

type AccountFilter = (typeof ACCOUNT_FILTERS)[number];

function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AccountsScreen() {
  const filterTriggerRef = useRef<TriggerRef>(null);
  const accountsQuery = useAccountsQuery();
  const deleteAccountMutation = useDeleteAccountMutation();
  const accounts = accountsQuery.data ?? [];
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('All');
  const [search, setSearch] = useState('');
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const filteredAccounts = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesFilter =
        activeFilter === 'All' || ACCOUNT_TYPE_META[account.type].label === activeFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${account.name} ${account.currency} ${ACCOUNT_TYPE_META[account.type].label}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [accounts, activeFilter, search]);
  const visibleAccounts = showAllAccounts ? filteredAccounts : filteredAccounts.slice(0, 8);

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Wallets and balances"
            title="See all your money in one place"
            subtitle="Track cash, bank balances, and cards without switching between apps."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="gap-4">
              <View>
                <Text className="text-[28px] font-semibold text-[#f4f7f5]">Accounts</Text>
                <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
                  Manage your wallets and balances.
                </Text>
              </View>
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

            <View className="mt-5 rounded-[26px] bg-[#121916] p-4">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#7f8c86]">Net worth</Text>
                  <Text className="mt-1 text-[32px] font-semibold text-[#f4f7f5]">
                    {formatCurrency(totalBalance)}
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-[#7f8c86]">
                    Based on the real accounts currently saved in your app.
                  </Text>
                </View>
                <View className="size-12 items-center justify-center rounded-full bg-[#1a2c1f]">
                  <Icon as={TrendingUpIcon} className="size-5 text-[#8bff62]" />
                </View>
              </View>

              <View className="mt-5 flex-row items-center justify-between gap-3">
                <Text className="text-sm font-medium text-[#7f8c86]">Filter accounts</Text>
                <Popover>
                  <PopoverTrigger asChild ref={filterTriggerRef}>
                    <Pressable className="flex-row items-center gap-2 rounded-full bg-[#131b17] px-4 py-3">
                      <Text className="text-sm font-semibold text-[#f4f7f5]">{activeFilter}</Text>
                      <ChevronDownIcon color="#dce2de" size={16} />
                    </Pressable>
                  </PopoverTrigger>
                  <PopoverContent align="end" side="bottom" className="w-48 border-[#17211c] bg-[#101713] p-2">
                    <View className="gap-1">
                      {ACCOUNT_FILTERS.map((filter) => {
                        const isActive = filter === activeFilter;

                        return (
                          <Pressable
                            key={filter}
                            className={`rounded-[14px] px-3 py-3 ${
                              isActive ? 'bg-[#8bff62]' : 'bg-transparent'
                            }`}
                            onPress={() => {
                              setActiveFilter(filter);
                              filterTriggerRef.current?.close();
                            }}>
                            <Text
                              className={`text-sm font-semibold ${
                                isActive ? 'text-[#07110a]' : 'text-[#dce2de]'
                              }`}>
                              {filter}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </PopoverContent>
                </Popover>
              </View>
            </View>

            <View className="mt-5 gap-4">
              {accountsQuery.isLoading ? (
                <Text className="text-sm text-[#7f8c86]">Loading accounts...</Text>
              ) : null}
              <View className="flex-row items-center gap-3 rounded-[18px] bg-[#131b17] px-4 py-1">
                <SearchIcon color="#8b9490" size={16} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search accounts"
                  placeholderTextColor="#6d786f"
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="off"
                  className="h-12 flex-1 bg-transparent px-0 text-[16px] text-[#f4f7f5]"
                />
              </View>
              {visibleAccounts.map((account) => (
                <View
                  key={account.id}
                  className={`rounded-[24px] border p-4 ${ACCOUNT_TYPE_META[account.type].cardClassName}`}>
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`size-11 items-center justify-center rounded-full ${ACCOUNT_TYPE_META[account.type].iconWrapClassName}`}>
                      <Icon as={CreditCardIcon} className="size-5 text-[#f4f7f5]" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-[#f4f7f5]">{account.name}</Text>
                      <Text
                        className={`mt-1 text-sm font-semibold ${ACCOUNT_TYPE_META[account.type].accentTextClassName}`}>
                        {ACCOUNT_TYPE_META[account.type].label}
                      </Text>
                      <Text className="mt-1 text-sm text-[#7f8c86]">{account.currency} account</Text>
                    </View>
                  </View>
                  <View className="mt-4 border-t border-white/5 pt-4">
                    <View className="flex-row items-end justify-between gap-3">
                      <View>
                        <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                          Balance
                        </Text>
                        <Text className="mt-1 text-xl font-semibold text-[#f4f7f5]">
                          {formatCurrency(Number(account.balance), account.currency)}
                        </Text>
                      </View>
                      {confirmingDeleteId === account.id ? (
                        <View className="items-end gap-2">
                          <Text className="text-xs font-medium text-[#ffb4bb]">Delete this account?</Text>
                          <View className="flex-row items-center gap-2">
                            <Pressable
                              className="rounded-full bg-[#131b17] px-3 py-2"
                              onPress={() => setConfirmingDeleteId(null)}>
                              <Text className="text-sm font-semibold text-[#dce2de]">Cancel</Text>
                            </Pressable>
                            <Pressable
                              className="rounded-full bg-[#1d1416] px-3 py-2"
                              disabled={deleteAccountMutation.isPending}
                              onPress={async () => {
                                await deleteAccountMutation.mutateAsync(account.id);
                                setConfirmingDeleteId(null);
                              }}>
                              <View className="flex-row items-center gap-2">
                                <Trash2Icon color="#ff8a94" size={14} />
                                <Text className="text-sm font-semibold text-[#ff8a94]">
                                  {deleteAccountMutation.isPending ? 'Deleting...' : 'Confirm'}
                                </Text>
                              </View>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <Pressable
                          className="rounded-full bg-[#1d1416] px-3 py-2"
                          disabled={deleteAccountMutation.isPending}
                          onPress={() => setConfirmingDeleteId(account.id)}>
                          <View className="flex-row items-center gap-2">
                            <Trash2Icon color="#ff8a94" size={14} />
                            <Text className="text-sm font-semibold text-[#ff8a94]">Delete</Text>
                          </View>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              ))}
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
                  onPress={() => setShowAllAccounts((current) => !current)}
                />
              ) : null}
              {!accountsQuery.isLoading && filteredAccounts.length === 0 ? (
                <View className="rounded-[24px] bg-[#131b17] p-4">
                  <Text className="text-sm leading-6 text-[#7f8c86]">
                    No {activeFilter.toLowerCase()} accounts yet.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="accounts" />
    </View>
  );
}
