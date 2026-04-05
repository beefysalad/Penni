import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { SearchInput } from '@/components/ui/search-input';
import { Text } from '@/components/ui/text';
import {
  AccountCard,
  AccountsEmptyState,
  AccountSkeletonCard,
  AccountSwipeableRow,
} from '@/features/finance/components/accounts-sections';
import {
  useAccountsQuery,
  useDeleteAccountMutation,
} from '@/features/finance/hooks/use-accounts-query';
import {
  ACCOUNT_FILTERS,
  type AccountFilter,
  ACCOUNT_TYPE_META,
} from '@/features/finance/lib/constants';
import { formatCurrency } from '@/features/finance/lib/formatters';
import { getNetWorth, getTypeBreakdown } from '@/features/finance/lib/selectors';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowUpRightIcon,
  BanknoteIcon,
  CalendarClockIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AccountsScreen() {
  const accountsQuery = useAccountsQuery();
  const deleteAccountMutation = useDeleteAccountMutation();
  const accounts = accountsQuery.data ?? [];
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('All');
  const [search, setSearch] = useState('');
  const [showAllAccounts, setShowAllAccounts] = useState(false);

  const totalBalance = getNetWorth(accounts);
  const typeBreakdown = useMemo(() => getTypeBreakdown(accounts), [accounts]);
  const isNegativeNetWorth = totalBalance < 0;

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
    <GestureHandlerRootView className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-44"
        showsVerticalScrollIndicator={false}>
        <View className="pt-safe rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-4">
          <AppPageHeader
            eyebrow="Wallets and balances"
            title="See all your money in one place"
            subtitle="Track cash, bank balances, and cards without switching between apps."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#7f8c86]">Net worth</Text>
                <Text
                  className={`mt-1 text-[34px] font-semibold tracking-[-1px] ${isNegativeNetWorth ? 'text-[#ff8a94]' : 'text-[#f4f7f5]'}`}>
                  {formatCurrency(totalBalance)}
                </Text>
              </View>
              <View
                className={`size-12 items-center justify-center rounded-full ${isNegativeNetWorth ? 'bg-[#2c1a1f]' : 'bg-[#1a2c1f]'}`}>
                <Icon
                  as={isNegativeNetWorth ? TrendingDownIcon : TrendingUpIcon}
                  className={`size-5 ${isNegativeNetWorth ? 'text-[#ff8a94]' : 'text-[#8bff62]'}`}
                />
              </View>
            </View>

            {typeBreakdown.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pt-4">
                {typeBreakdown.map(([type, balance]) => {
                  const meta = ACCOUNT_TYPE_META[type];
                  const TypeIcon = meta.icon;
                  const isNegativeBreakdown = balance < 0;

                  return (
                    <View
                      key={type}
                      className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3 py-2">
                      <TypeIcon color={meta.accentColor} size={13} />
                      <Text className={`text-xs font-semibold ${meta.accentTextClassName}`}>
                        {meta.label}
                      </Text>
                      <Text
                        className={`text-xs ${isNegativeBreakdown ? 'text-[#ff8a94]' : 'text-[#7f8c86]'}`}>
                        {formatCurrency(balance)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pt-4">
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#16211b] px-3.5 py-2"
                onPress={() => router.push('/transaction-compose?type=INCOME')}>
                <ArrowUpRightIcon color="#41d6b2" size={13} />
                <Text className="text-xs font-semibold text-[#41d6b2]">Add Transaction</Text>
              </Pressable>
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3.5 py-2"
                onPress={() => router.push('/plan-ahead')}>
                <CalendarClockIcon color="#8bff62" size={13} />
                <Text className="text-xs font-semibold text-[#93a19a]">Plan ahead</Text>
              </Pressable>
            </ScrollView>
          </View>

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

            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search accounts"
              className="mt-4"
            />

            <View className="mt-4 gap-5">
              {accountsQuery.isLoading ? (
                <>
                  <AccountSkeletonCard />
                  <AccountSkeletonCard />
                  <AccountSkeletonCard />
                </>
              ) : null}

              {!accountsQuery.isLoading && visibleAccounts.length > 0
                ? visibleAccounts.map((account) => (
                    <AccountSwipeableRow
                      key={account.id}
                      onDelete={async () => {
                        await deleteAccountMutation.mutateAsync(account.id);
                      }}>
                      <AccountCard
                        account={account}
                        onPress={() =>
                          router.push({
                            pathname: '/account-details',
                            params: { id: account.id },
                          })
                        }
                      />
                    </AccountSwipeableRow>
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
                <AccountsEmptyState filter={activeFilter} />
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="accounts" />
    </GestureHandlerRootView>
  );
}
