import { AppPageHeader } from '@/components/app-page-header';
import { AppTabBar } from '@/components/app-tab-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { accountOptions, quickCategories } from '@/lib/mock-finance';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

const MODES = ['Expense', 'Income'] as const;

export default function AddTransactionScreen() {
  const [mode, setMode] = React.useState<(typeof MODES)[number]>('Expense');
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');
  const [selectedAccount, setSelectedAccount] =
    React.useState<(typeof accountOptions)[number]>('BPI Savings');

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#060b08]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-36"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Quick capture"
            title="Log an expense in seconds"
            subtitle="Use the native keyboard, choose a category, and keep moving."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-[28px] font-semibold text-[#f4f7f5]">New transaction</Text>
            <Text className="mt-1 text-[15px] leading-6 text-[#7f8c86]">
              Keep the input flow simple and phone-friendly.
            </Text>

            <View className="mt-5 flex-row gap-3 rounded-[24px] bg-[#131b17] p-2">
              {MODES.map((item) => {
                const isSelected = item === mode;
                return (
                  <Button
                    key={item}
                    variant="ghost"
                    className={`h-12 flex-1 rounded-[18px] ${isSelected ? 'bg-[#8bff62]' : 'bg-transparent'}`}
                    onPress={() => setMode(item)}>
                    <Text className={`text-sm font-semibold ${isSelected ? 'text-[#07110a]' : 'text-[#7f8c86]'}`}>
                      {item}
                    </Text>
                  </Button>
                );
              })}
            </View>

            <View className="mt-5 rounded-[26px] bg-[#121916] p-5">
              <Text className="text-sm font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                Amount
              </Text>
              <Input
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#6d786f"
                className="mt-3 h-20 rounded-[22px] border-0 bg-[#0b120e] px-5 text-[36px] font-semibold text-[#f4f7f5]"
              />
              <Text className="mt-3 text-sm text-[#7f8c86]">
                Add the value first, then fill in the details below.
              </Text>
            </View>

            <View className="mt-5">
              <Text className="text-sm font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                Account
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-3">
                {accountOptions.map((account) => {
                  const isSelected = account === selectedAccount;
                  return (
                    <Button
                      key={account}
                      variant="ghost"
                      className={`h-12 rounded-full px-5 ${isSelected ? 'bg-[#8bff62]' : 'bg-[#131b17]'}`}
                      onPress={() => setSelectedAccount(account)}>
                      <Text className={`text-sm font-semibold ${isSelected ? 'text-[#07110a]' : 'text-[#7f8c86]'}`}>
                        {account}
                      </Text>
                    </Button>
                  );
                })}
              </View>
            </View>

            <View className="mt-5">
              <Text className="text-sm font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                Category
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-3">
                {quickCategories.map((category) => (
                  <View key={category.label} className={`rounded-full px-4 py-3 ${category.className}`}>
                    <Text className="text-sm font-semibold">{category.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-5 gap-2">
              <Text className="text-sm font-medium uppercase tracking-[1.8px] text-[#6d786f]">
                Note
              </Text>
              <Input
                value={note}
                onChangeText={setNote}
                placeholder="Lunch, groceries, or a quick reminder for future you"
                placeholderTextColor="#6d786f"
                multiline
                className="min-h-[112px] rounded-[24px] border-0 bg-[#121916] px-4 py-4 text-base leading-6 text-[#f4f7f5]"
              />
            </View>

            <Button className="mt-6 h-14 rounded-[22px] bg-[#8bff62]">
              <Text className="text-base font-semibold text-[#07110a]">
                Save {mode.toLowerCase()}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="add" />
    </KeyboardAvoidingView>
  );
}
