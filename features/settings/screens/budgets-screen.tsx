import { AppPageHeader } from '@/components/navigation/app-page-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

const BUDGET_IDEAS = [
  'Food and dining',
  'Transport',
  'Bills and utilities',
  'Shopping',
] as const;

export default function BudgetsScreen() {
  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <View className="mb-4">
            <Button
              variant="ghost"
              className="h-11 self-start rounded-full bg-[#111916] px-4"
              onPress={() => router.back()}>
              <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
            </Button>
          </View>

          <AppPageHeader
            eyebrow="Budget planning"
            title="Budgets"
            subtitle="This is where category budgets should live. We can shape the UI now even before the backend is ready."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-[24px] font-semibold text-[#f4f7f5]">What belongs here</Text>
            <Text className="mt-2 text-[15px] leading-6 text-[#7f8c86]">
              Monthly limits per category, current spend against that limit, and quick flags when a category starts drifting.
            </Text>
          </View>

          <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-[24px] font-semibold text-[#f4f7f5]">Likely first budgets</Text>
            <View className="mt-4 gap-3">
              {BUDGET_IDEAS.map((idea) => (
                <View key={idea} className="rounded-[22px] bg-[#131b17] px-4 py-4">
                  <Text className="text-base font-semibold text-[#f4f7f5]">{idea}</Text>
                  <Text className="mt-1 text-sm leading-6 text-[#7f8c86]">
                    Set a monthly cap once the budget flow is wired.
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[28px] border border-dashed border-[#284034] bg-[#0c1510] p-5">
            <Text className="text-sm font-semibold text-[#f4f7f5]">Not live yet</Text>
            <Text className="mt-2 text-sm leading-6 text-[#7f8c86]">
              The destination is ready, but real budget creation still needs the backend model and form flow.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
