import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { transactionFeed } from '@/features/finance/lib/mock-finance';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PlusIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

export default function ActivityScreen() {
  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Transactions"
            title="Activity"
            subtitle="Review recent money movement, scan categories, and add a new entry fast."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Input
                  placeholder="Search transactions"
                  placeholderTextColor="#6d786f"
                  className="h-12 rounded-[18px] border-[#1d2a20] bg-[#111916] px-4 text-white"
                />
              </View>
              <View className="size-12 items-center justify-center rounded-[18px] bg-[#131b17]">
                <Icon as={SearchIcon} className="size-5 text-[#8b9490]" />
              </View>
              <View className="size-12 items-center justify-center rounded-[18px] bg-[#131b17]">
                <Icon as={SlidersHorizontalIcon} className="size-5 text-[#8b9490]" />
              </View>
            </View>

            <Button
              className="mt-5 h-14 rounded-[22px] bg-[#8bff62]"
              onPress={() => router.push('/transaction-compose')}>
              <Icon as={PlusIcon} className="mr-2 size-5 text-[#07110a]" />
              <Text className="text-base font-semibold text-[#07110a]">New transaction</Text>
            </Button>
          </View>

          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <View className="gap-3">
              <Text className="text-[28px] font-semibold text-[#f4f7f5]">Recent activity</Text>
              <Text className="text-[15px] leading-6 text-[#7f8c86]">
                This screen is a better long-term home for history, filter, edit, and delete.
              </Text>
              <View className="self-start rounded-full bg-[#131b17] px-3 py-2">
                <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-[#8bff62]">
                  18 this month
                </Text>
              </View>
            </View>

            <View className="mt-5 gap-3">
              {transactionFeed.map((transaction) => (
                <View
                  key={`${transaction.title}-${transaction.time}`}
                  className={`flex-row items-center gap-4 rounded-[24px] px-4 py-4 ${transaction.toneClassName}`}>
                  <View
                    className={`size-12 items-center justify-center rounded-full ${transaction.iconClassName}`}>
                    <Text className="text-base font-semibold text-[#f4f7f5]">
                      {transaction.title[0]}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-[#f4f7f5]">
                      {transaction.title}
                    </Text>
                    <Text className="mt-1 text-sm text-[#7f8c86]">
                      {transaction.account} • {transaction.category}
                    </Text>
                    <Text className="mt-2 text-[11px] font-semibold uppercase tracking-[1.6px] text-[#6d786f]">
                      {transaction.time}
                    </Text>
                  </View>
                  <Text className={`text-base font-semibold ${transaction.amountClassName}`}>
                    {transaction.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="activity" />
    </View>
  );
}
