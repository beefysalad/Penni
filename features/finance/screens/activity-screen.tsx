import { AppTabBar } from '@/components/navigation/app-tab-bar';
import {
  ActivityEmptyState,
  ActivityListFooter,
  ActivityListHeader,
  ActivitySectionHeader,
  ActivitySkeletonTransaction,
  ActivitySwipeableRow,
  ActivityTransactionRow,
} from '@/features/finance/components/activity-sections';
import { type TypeFilter } from '@/features/finance/lib/constants';
import { groupTransactionsIntoSections } from '@/features/finance/lib/selectors';
import {
  useDeleteTransactionMutation,
  useTransactionsInfiniteQuery,
} from '@/features/finance/hooks/use-transactions-query';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  const infiniteQuery = useTransactionsInfiniteQuery();
  const deleteTransactionMutation = useDeleteTransactionMutation();

  // Flatten pages into a single array
  const allTransactions = useMemo(
    () => infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [infiniteQuery.data]
  );

  // Summary stats from the first page (covers the whole dataset)
  const summary = infiniteQuery.data?.pages[0]?.summary;
  const totalIncome = parseFloat(summary?.totalIncome ?? '0');
  const totalExpense = parseFloat(summary?.totalExpense ?? '0');
  const netCashFlow = totalIncome - totalExpense;

  // Client-side filtering on loaded data
  const filteredTransactions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return allTransactions.filter((t) => {
      const matchesType =
        typeFilter === 'All' ||
        (typeFilter === 'Expenses' && t.type === 'EXPENSE') ||
        (typeFilter === 'Income' && t.type === 'INCOME');
      const matchesSearch = !needle || `${t.title} ${t.notes ?? ''}`.toLowerCase().includes(needle);

      return matchesType && matchesSearch;
    });
  }, [search, typeFilter, allTransactions]);

  const sections = useMemo(
    () => groupTransactionsIntoSections(filteredTransactions),
    [filteredTransactions]
  );

  const handleDelete = useCallback(
    async (transactionId: string) => {
      await deleteTransactionMutation.mutateAsync(transactionId);
    },
    [deleteTransactionMutation]
  );

  // ─── Infinite scroll ───────────────────────────────────────────────────
  const handleEndReached = useCallback(() => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
  }, [infiniteQuery]);

  const handleRefresh = useCallback(() => {
    infiniteQuery.refetch();
  }, [infiniteQuery]);

  const renderInitialLoading = () => (
    <View className="mx-6 overflow-hidden rounded-b-[30px] border-x border-b border-[#17211c] bg-[#111916]">
      <ActivitySkeletonTransaction />
      <View className="border-t border-[#17211c]/60" />
      <ActivitySkeletonTransaction />
      <View className="border-t border-[#17211c]/60" />
      <ActivitySkeletonTransaction />
      <View className="border-t border-[#17211c]/60" />
      <ActivitySkeletonTransaction />
    </View>
  );

  return (
    <GestureHandlerRootView className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />

      <SectionList
        sections={infiniteQuery.isLoading ? [] : sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        ListHeaderComponent={
          <ActivityListHeader
            netCashFlow={netCashFlow}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            typeFilter={typeFilter}
            search={search}
            onChangeTypeFilter={setTypeFilter}
            onChangeSearch={setSearch}
          />
        }
        ListEmptyComponent={
          infiniteQuery.isLoading ? (
            renderInitialLoading()
          ) : (
            <View className="px-6 pt-2">
              <ActivityEmptyState hasSearch={search.trim().length > 0} />
            </View>
          )
        }
        ListFooterComponent={
          <ActivityListFooter isFetchingNextPage={infiniteQuery.isFetchingNextPage} />
        }
        renderSectionHeader={({ section }) => (
          <View className="px-6">
            <ActivitySectionHeader title={section.title} count={section.count} />
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View className="px-6">
            <View
              className={`overflow-hidden ${index === 0 ? 'rounded-t-[22px] border-t' : ''} ${
                index === section.data.length - 1 ? 'rounded-b-[22px] border-b' : ''
              } border-x border-[#17211c] bg-[#111916]`}>
              <ActivitySwipeableRow onDelete={() => handleDelete(item.id)}>
                <ActivityTransactionRow
                  transaction={item}
                  isLast={index === section.data.length - 1}
                />
              </ActivitySwipeableRow>
            </View>
          </View>
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={infiniteQuery.isRefetching && !infiniteQuery.isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor="#8bff62"
            colors={['#8bff62']}
          />
        }
      />

      <AppTabBar currentTab="activity" />
    </GestureHandlerRootView>
  );
}
