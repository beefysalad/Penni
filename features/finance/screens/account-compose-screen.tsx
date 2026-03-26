import { Field } from '@/components/forms/field';
import { SectionHeader } from '@/components/forms/section-header';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Building2Icon, Wallet2Icon } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

const ACCOUNT_TYPES = ['Cash', 'Bank account', 'E-wallet', 'Credit card'] as const;
const ACCOUNT_CURRENCIES = ['PHP', 'USD', 'SGD'] as const;

export default function AccountComposeScreen() {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedType, setSelectedType] =
    useState<(typeof ACCOUNT_TYPES)[number]>('E-wallet');
  const [selectedCurrency, setSelectedCurrency] =
    useState<(typeof ACCOUNT_CURRENCIES)[number]>('PHP');

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

          <SheetHeader eyebrow="Accounts" title="Add account" />

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-5 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="items-center rounded-[22px] bg-[#101a14] px-5 py-5">
                <View className="size-14 items-center justify-center rounded-[20px] bg-[#163022]">
                  <Wallet2Icon color="#8bff62" size={24} />
                </View>
                <Text className="mt-4 text-[24px] font-semibold text-[#f4f7f5]">
                  New {selectedType.toLowerCase()}
                </Text>
                <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                  Add a source of money you want Penni to include in balances and future transaction flows.
                </Text>
              </View>

              <View className="mt-5 gap-4">
                <Field label="Account name">
                  <View className="rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="GCash, BPI Savings, Cash Wallet"
                      placeholderTextColor="#6f7d74"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="off"
                      className="h-12 bg-transparent px-0 text-[17px] text-[#f4f7f5]"
                    />
                  </View>
                </Field>

                <Field label="Starting balance">
                  <View className="flex-row items-center rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                    <Text className="mr-3 text-[22px] font-medium text-[#6f7d74]">₱</Text>
                    <TextInput
                      value={balance}
                      onChangeText={setBalance}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#6f7d74"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="off"
                      className="h-12 flex-1 bg-transparent px-0 text-[22px] font-semibold text-[#f4f7f5]"
                    />
                  </View>
                </Field>
              </View>
            </View>

            <SectionHeader title="Type" actionLabel="Choose one" />
            <View className="flex-row flex-wrap gap-3">
              {ACCOUNT_TYPES.map((type) => {
                const isSelected = type === selectedType;

                return (
                  <Pressable
                    key={type}
                    className={`rounded-full border px-4 py-3 ${
                      isSelected ? 'border-[#8bff62] bg-[#1f3526]' : 'border-[#17211c] bg-[#0f1512]'
                    }`}
                    onPress={() => setSelectedType(type)}>
                    <Text
                      className={`text-sm font-semibold ${isSelected ? 'text-[#8bff62]' : 'text-[#dce2de]'}`}>
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionHeader title="Currency" actionLabel="Default" />
            <View className="flex-row gap-3">
              {ACCOUNT_CURRENCIES.map((currency) => {
                const isSelected = currency === selectedCurrency;

                return (
                  <Pressable
                    key={currency}
                    className={`flex-1 rounded-[20px] border px-4 py-4 ${
                      isSelected ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#0f1512]'
                    }`}
                    onPress={() => setSelectedCurrency(currency)}>
                    <Text
                      className={`text-center text-base font-semibold ${
                        isSelected ? 'text-[#8bff62]' : 'text-[#f4f7f5]'
                      }`}>
                      {currency}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] px-4 py-4">
              <View className="flex-row items-start gap-3">
                <View className="size-11 items-center justify-center rounded-2xl bg-[#16262d]">
                  <Building2Icon color="#dce2de" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                    Manual account
                  </Text>
                  <Text className="mt-1 text-base font-semibold text-[#f4f7f5]">
                    No institution needed here
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-[#7f8c86]">
                    We are only creating a local account entry for now, so there is no bank or provider connection to select.
                  </Text>
                </View>
              </View>
            </View>

            <Button className="h-14 rounded-[22px] bg-[#8bff62]" onPress={() => router.back()}>
              <Text className="text-base font-semibold text-[#07110a]">Save account</Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
