import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  accountCards,
  accountFilters,
  budgets,
  weeklyBars,
} from '@/features/finance/lib/mock-finance';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CreditCardIcon, EllipsisIcon, PlusIcon, TrendingUpIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function AccountsScreen() {
  const [activeFilter, setActiveFilter] =
    React.useState<(typeof accountFilters)[number]>('All');

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-44"
        showsVerticalScrollIndicator={false}>
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
              <Button
                className="h-12 self-start rounded-full bg-[#8bff62] px-5"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/account-compose')}>
                <Icon as={PlusIcon} className="mr-1 size-4 text-[#07110a]" />
                <Text className="text-sm font-semibold text-[#07110a]">Add account</Text>
              </Button>
            </View>

            <View className="mt-5 rounded-[26px] bg-[#121916] p-4">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#7f8c86]">Net worth</Text>
                  <Text className="mt-1 text-[32px] font-semibold text-[#f4f7f5]">₱19,920</Text>
                  <Text className="mt-2 text-sm leading-5 text-[#7f8c86]">
                    Debt balances minus credit card debt.
                  </Text>
                </View>
                <View className="size-12 items-center justify-center rounded-full bg-[#1a2c1f]">
                  <Icon as={TrendingUpIcon} className="size-5 text-[#8bff62]" />
                </View>
              </View>

              <View className="mt-5 flex-row gap-2">
                {accountFilters.map((filter) => {
                  const isActive = activeFilter === filter;

                  return (
                    <Pressable
                    key={filter}
                    className={`rounded-full px-4 py-3 ${isActive ? 'bg-[#8bff62]' : 'bg-[#1a221e]'}`}
                    onPress={() => setActiveFilter(filter)}
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${filter} accounts`}>
                    <Text
                      className={`text-sm font-semibold ${isActive ? 'text-[#07110a]' : 'text-[#7f8c86]'}`}>
                      {filter}
                    </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-5 gap-3">
                <View className="rounded-[22px] bg-[#0f1512] p-4">
                  <Text className="text-sm font-medium text-[#7f8c86]">Reality check</Text>
                  <Text className="mt-3 text-sm leading-6 text-[#f4f7f5]">
                    Past 15k is real breathing room, especially if you keep the next two weeks
                    boring.
                  </Text>
                </View>
                <View className="rounded-[22px] bg-[#0f1512] p-4">
                  <Text className="text-sm font-medium text-[#7f8c86]">Balance per day</Text>
                  <View className="mt-5 flex-row items-end justify-between gap-2">
                    {weeklyBars.map((barClassName, index) => (
                      <View key={`${barClassName}-${index}`} className="flex-1 items-center gap-2">
                        <View className={`w-3 rounded-full ${barClassName}`} />
                        <Text className="text-[10px] font-semibold uppercase text-[#6d786f]">
                          {['W', 'T', 'F', 'S', 'S', 'M', 'T'][index]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View className="mt-5 gap-4">
              {accountCards.map((account) => (
                <View
                  key={account.name}
                  className={`rounded-[24px] p-4 ${account.accentClassName}`}>
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`size-11 items-center justify-center rounded-full ${account.iconClassName}`}>
                      <Icon as={CreditCardIcon} className="size-5 text-[#8bff62]" />
                      </View>
                      <View>
                        <Text className="text-base font-semibold text-[#f4f7f5]">{account.name}</Text>
                        <Text className="mt-1 text-sm text-[#7f8c86]">{account.type}</Text>
                      </View>
                    </View>
                    <Icon as={EllipsisIcon} className="size-4 text-[#6d786f]" />
                  </View>
                  <View className="mt-5 flex-row items-end justify-between gap-3">
                    <View>
                      <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                        Balance
                      </Text>
                      <Text className="mt-1 text-[28px] font-semibold text-[#f4f7f5]">
                        {account.balance}
                      </Text>
                    </View>
                    <View className="rounded-full bg-[#111916] px-3 py-2">
                      <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-[#8bff62]">
                        {activeFilter}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="flex-row items-center justify-between gap-4">
              <Text className="text-[24px] font-semibold text-[#f4f7f5]">Active budgets</Text>
              <Text className="text-sm font-semibold text-[#8bff62]">Manage</Text>
            </View>
            <View className="mt-5 gap-4">
              {budgets.slice(0, 2).map((budget) => (
                <View key={budget.name} className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-[#f4f7f5]">{budget.name}</Text>
                    <Text className="text-sm text-[#7f8c86]">
                      {budget.used} / {budget.total}
                    </Text>
                  </View>
                  <View
                    className="h-3 overflow-hidden rounded-full"
                    style={{ backgroundColor: budget.trackColor }}>
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${budget.progress * 100}%`,
                        backgroundColor: budget.fillColor,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="accounts" />
    </View>
  );
}
