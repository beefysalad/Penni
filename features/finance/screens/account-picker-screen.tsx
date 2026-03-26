import { SheetHeader } from '@/components/sheets/sheet-header';
import { Text } from '@/components/ui/text';
import { useAccountsQuery } from '@/features/finance/hooks/use-accounts-query';
import { useTransactionCompose } from '@/features/finance/lib/transaction-compose-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { SearchIcon, Wallet2Icon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

const ACCOUNT_TYPE_META = {
  CASH: {
    label: 'Cash',
    iconWrapClassName: 'bg-[#173223]',
    accentTextClassName: 'text-[#41d6b2]',
  },
  BANK_ACCOUNT: {
    label: 'Debit',
    iconWrapClassName: 'bg-[#163022]',
    accentTextClassName: 'text-[#8bff62]',
  },
  E_WALLET: {
    label: 'E-wallet',
    iconWrapClassName: 'bg-[#16262d]',
    accentTextClassName: 'text-[#5aa9ff]',
  },
  CREDIT_CARD: {
    label: 'Credit',
    iconWrapClassName: 'bg-[#2a1d32]',
    accentTextClassName: 'text-[#ffc857]',
  },
  OTHER: {
    label: 'Other',
    iconWrapClassName: 'bg-[#202018]',
    accentTextClassName: 'text-[#d8ff5b]',
  },
} as const;

export default function AccountPickerScreen() {
  const accountsQuery = useAccountsQuery();
  const { selectedAccountId, setSelectedAccountId } = useTransactionCompose();
  const [search, setSearch] = useState('');

  const filteredAccounts = useMemo(() => {
    const accounts = accountsQuery.data ?? [];
    const query = search.trim().toLowerCase();

    if (!query) {
      return accounts;
    }

    return accounts.filter((account) =>
      `${account.name} ${account.type} ${account.currency}`.toLowerCase().includes(query),
    );
  }, [accountsQuery.data, search]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black/50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={() => router.back()} />

        <View className="max-h-[88%] rounded-t-[34px] border-t border-[#1b2a21] bg-[#0b120e] pb-8 shadow-2xl shadow-black/60">
          <View className="items-center pt-3">
            <View className="h-1.5 w-16 rounded-full bg-[#2a392f]" />
          </View>

          <SheetHeader eyebrow="Accounts" title="Select account" />

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-5 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
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

            {accountsQuery.isLoading ? (
              <Text className="text-sm text-[#7f8c86]">Loading accounts...</Text>
            ) : null}

            <View className="gap-3">
              {filteredAccounts.map((account) => {
                const isSelected = account.id === selectedAccountId;

                return (
                  <Pressable
                    key={account.id}
                    className={`rounded-[20px] border px-4 py-4 ${
                      isSelected ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#131b17]'
                    }`}
                    onPress={() => {
                      setSelectedAccountId(account.id);
                      router.back();
                    }}>
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`size-11 items-center justify-center rounded-2xl ${ACCOUNT_TYPE_META[account.type].iconWrapClassName}`}>
                          <Wallet2Icon color={isSelected ? '#8bff62' : '#d9dfdb'} size={18} />
                        </View>
                        <View>
                          <Text className="text-base font-semibold text-[#f4f7f5]">{account.name}</Text>
                          <Text
                            className={`mt-1 text-sm font-semibold ${ACCOUNT_TYPE_META[account.type].accentTextClassName}`}>
                            {ACCOUNT_TYPE_META[account.type].label}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-base font-semibold text-[#f4f7f5]">{account.currency}</Text>
                        <Text className="mt-1 text-sm text-[#8d9a92]">{account.balance}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
