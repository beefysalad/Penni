import { SectionHeader } from '@/components/forms/section-header';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { accountOptions, quickCategories } from '@/features/finance/lib/mock-finance';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ChevronDownIcon, Wallet2Icon } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

const MODES = ['Expense', 'Income'] as const;

const ACCOUNT_META: Record<(typeof accountOptions)[number], { balance: string; tone: string }> = {
  'BPI Savings': { balance: '₱22,450', tone: 'bg-[#163022]' },
  GCash: { balance: '₱6,420', tone: 'bg-[#16262d]' },
  Cash: { balance: '₱1,850', tone: 'bg-[#173223]' },
  'BDO Visa': { balance: '₱33,700', tone: 'bg-[#2a1d32]' },
};

export default function TransactionComposeScreen() {
  const [mode, setMode] = useState<(typeof MODES)[number]>('Expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedAccount, setSelectedAccount] =
    useState<(typeof accountOptions)[number]>('GCash');
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof quickCategories)[number]['label']>('Groceries');

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black/50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={() => router.back()} />

        <View className="max-h-[92%] rounded-t-[34px] border-t border-[#1b2a21] bg-[#0b120e] pb-8 shadow-2xl shadow-black/60">
          <View className="items-center pt-3">
            <View className="h-1.5 w-16 rounded-full bg-[#2a392f]" />
          </View>

          <SheetHeader eyebrow="Quick Capture" title={`New ${mode}`} />

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-5 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-3">
              <View className="flex-row gap-2 rounded-[20px] bg-[#0a100d] p-1.5">
                {MODES.map((item) => {
                  const isSelected = item === mode;

                  return (
                    <Pressable
                      key={item}
                      className={`flex-1 rounded-[16px] px-4 py-3 ${isSelected ? 'bg-[#8bff62]' : 'bg-transparent'}`}
                      onPress={() => setMode(item)}>
                      <Text
                        className={`text-center text-[15px] font-semibold ${isSelected ? 'text-[#07110a]' : 'text-[#97a49c]'}`}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="items-center px-4 pb-4 pt-8">
                <Text className="text-[12px] font-semibold uppercase tracking-[2.6px] text-[#6f7d74]">
                  Amount
                </Text>
                <View className="mt-4 flex-row items-end justify-center">
                  <Text className="mb-3 mr-1 text-[34px] font-medium text-[#6e7f75]">₱</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#425248"
                    textAlign="center"
                    textAlignVertical="center"
                    className="min-w-[180px] bg-transparent px-0 py-0 text-center text-[56px] font-semibold text-[#f4f7f5]"
                    style={{
                      height: 72,
                      lineHeight: 56,
                      includeFontPadding: false,
                    }}
                  />
                </View>

                <View className="mt-5 w-full rounded-[20px] bg-[#141d18] px-4 py-1">
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="What was this for?"
                    placeholderTextColor="#7f8d85"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="off"
                    className="h-12 bg-transparent px-0 text-[16px] text-[#f4f7f5]"
                  />
                </View>
              </View>
            </View>

            <SectionHeader title="Account" actionLabel="Change" />
            <View className="flex-row flex-wrap gap-3">
              {accountOptions.map((account) => {
                const isSelected = account === selectedAccount;
                const meta = ACCOUNT_META[account];

                return (
                  <Pressable
                    key={account}
                    className={`min-w-[148px] flex-1 rounded-[24px] border p-4 ${
                      isSelected
                        ? 'border-[#52d776] bg-[#111c16]'
                        : 'border-[#17211c] bg-[#0f1512]'
                    }`}
                    onPress={() => setSelectedAccount(account)}>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className={`size-11 items-center justify-center rounded-2xl ${meta.tone}`}>
                        <Wallet2Icon color={isSelected ? '#8bff62' : '#d9dfdb'} size={18} />
                      </View>
                      {isSelected ? (
                        <View className="rounded-full bg-[#8bff62] px-2.5 py-1">
                          <Text className="text-[10px] font-semibold uppercase tracking-[1.3px] text-[#07110a]">
                            Selected
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-4 text-[17px] font-semibold text-[#f4f7f5]">{account}</Text>
                    <Text className="mt-1 text-sm text-[#8d9a92]">{meta.balance}</Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionHeader title="Category" actionLabel="Optional" />
            <View className="flex-row flex-wrap gap-3">
              {quickCategories.map((category) => {
                const isSelected = category.label === selectedCategory;

                return (
                  <Pressable
                    key={category.label}
                    className={`rounded-full border px-4 py-3 ${
                      isSelected
                        ? 'border-[#8bff62] bg-[#1f3526]'
                        : 'border-[#17211c] bg-[#0f1512]'
                    }`}
                    onPress={() => setSelectedCategory(category.label)}>
                    <Text
                      className={`text-sm font-semibold ${isSelected ? 'text-[#8bff62]' : 'text-[#dce2de]'}`}>
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                    Date
                  </Text>
                  <Text className="mt-2 text-base font-semibold text-[#f4f7f5]">Today</Text>
                </View>
                <View className="flex-row items-center gap-2 rounded-full bg-[#131b17] px-3 py-2">
                  <Text className="text-sm font-medium text-[#d7ddd9]">Now</Text>
                  <ChevronDownIcon color="#d7ddd9" size={16} />
                </View>
              </View>
            </View>

            <Button className="h-14 rounded-[22px] bg-[#8bff62]" onPress={() => router.back()}>
              <Text className="text-base font-semibold text-[#07110a]">
                Save {mode.toLowerCase()}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
