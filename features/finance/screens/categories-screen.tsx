import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

export default function CategoriesScreen() {
  const expenseCategoriesQuery = useCategoriesQuery({ type: 'EXPENSE' });
  const incomeCategoriesQuery = useCategoriesQuery({ type: 'INCOME' });

  const isLoading = expenseCategoriesQuery.isLoading || incomeCategoriesQuery.isLoading;
  const expenseCategories = expenseCategoriesQuery.data ?? [];
  const incomeCategories = incomeCategoriesQuery.data ?? [];

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Categories"
            title="Keep your entries organized"
            subtitle="Review your defaults and add custom categories for how you actually spend and earn."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Button
              className="h-12 self-start rounded-full bg-[#8bff62] px-5"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/category-compose')}>
              <PlusIcon color="#07110a" size={16} />
              <Text className="text-sm font-semibold text-[#07110a]">New category</Text>
            </Button>

            {isLoading ? (
              <Text className="mt-5 text-[15px] leading-6 text-[#7f8c86]">Loading categories...</Text>
            ) : null}

            <View className="mt-5 gap-5">
              <View>
                <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                  Expense
                </Text>
                <View className="mt-3 flex-row flex-wrap gap-2.5">
                  {expenseCategories.map((category) => (
                    <Pill
                      key={category.id}
                      label={category.name}
                      variant="subtle"
                      size="sm"
                      textStyle={{ color: category.colorHex ?? '#f4f7f5' }}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                  Income
                </Text>
                <View className="mt-3 flex-row flex-wrap gap-2.5">
                  {incomeCategories.map((category) => (
                    <Pill
                      key={category.id}
                      label={category.name}
                      variant="subtle"
                      size="sm"
                      textStyle={{ color: category.colorHex ?? '#f4f7f5' }}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="profile" />
    </View>
  );
}
