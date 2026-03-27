import { SectionHeader } from '@/components/forms/section-header';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Badge, Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useAccountsQuery } from '@/features/finance/hooks/use-accounts-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useCreateTransactionMutation } from '@/features/finance/hooks/use-transactions-query';
import { ACCOUNT_TYPE_META, TRANSACTION_MODES } from '@/features/finance/lib/constants';
import { useTransactionCompose } from '@/features/finance/lib/transaction-compose-context';
import { createTransactionSchema } from '@/features/finance/lib/finance.schemas';
import type { CategoryType } from '@/features/finance/lib/finance.types';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CalendarIcon, ChevronDownIcon, Wallet2Icon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

export default function TransactionComposeScreen() {
  const [mode, setMode] = useState<(typeof TRANSACTION_MODES)[number]>('Expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const {
    selectedAccountId,
    setSelectedAccountId,
    selectedCategoryId,
    setSelectedCategoryId,
    resetCompose,
  } = useTransactionCompose();
  const createTransactionMutation = useCreateTransactionMutation();
  const formattedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(transactionDate),
    [transactionDate],
  );

  const categoryType: CategoryType = mode === 'Expense' ? 'EXPENSE' : 'INCOME';
  const accountsQuery = useAccountsQuery();
  const categoriesQuery = useCategoriesQuery({ type: categoryType });

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId, setSelectedAccountId]);

  useEffect(() => {
    if (!selectedCategoryId || !categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0]?.id ?? null);
    }
  }, [categories, selectedCategoryId, setSelectedCategoryId]);

  useFocusEffect(
    useCallback(() => {
      void accountsQuery.refetch();
      void categoriesQuery.refetch();
    }, [accountsQuery, categoriesQuery]),
  );

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? null;
  const quickCategories = useMemo(() => categories.slice(0, 4), [categories]);

  const handleDateChange = (event: DateTimePickerEvent, nextDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setIsDatePickerOpen(false);
    }

    if (event.type === 'dismissed' || !nextDate) {
      return;
    }

    setTransactionDate(nextDate);
  };

  const canSave = Boolean(selectedAccountId && selectedCategoryId && amount.trim());

  const handleSaveTransaction = async () => {
    const parsed = createTransactionSchema.safeParse({
      accountId: selectedAccountId ?? '',
      categoryId: selectedCategoryId ?? '',
      type: categoryType,
      title: note.trim() || `${mode} entry`,
      notes: note.trim() || undefined,
      amount: amount.trim(),
      currency: selectedAccount?.currency ?? 'PHP',
      transactionAt: transactionDate.toISOString(),
    });

    if (!parsed.success) {
      return;
    }

    await createTransactionMutation.mutateAsync({
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId,
      type: parsed.data.type,
      title: parsed.data.title,
      notes: parsed.data.notes,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      transactionAt: parsed.data.transactionAt,
    });

    setAmount('');
    setNote('');
    setTransactionDate(new Date());
    resetCompose();
    router.back();
  };

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
            contentContainerClassName="gap-4 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-3">
              <View className="flex-row gap-2 rounded-[20px] bg-[#0a100d] p-1.5">
                {TRANSACTION_MODES.map((item) => {
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
                    className="min-w-[180px] bg-transparent px-0 py-0 text-center text-[56px] font-semibold text-[#f4f7f5]"
                    style={{ height: 72, lineHeight: 56, includeFontPadding: false }}
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

            <SectionHeader title="Account" />
            {accountsQuery.isLoading ? (
              <Text className="text-sm text-[#7f8c86]">Loading accounts...</Text>
            ) : null}
            {accounts.length > 0 ? (
              <View className="gap-2.5">
                {selectedAccount ? (
                  <View className="rounded-[22px] border border-[#52d776] bg-[#111c16] p-4">
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`size-11 items-center justify-center rounded-2xl ${ACCOUNT_TYPE_META[selectedAccount.type].iconWrapClassName}`}>
                          <Wallet2Icon color="#8bff62" size={18} />
                        </View>
                        <View>
                          <Text className="text-[17px] font-semibold text-[#f4f7f5]">
                            {selectedAccount.name}
                          </Text>
                          <View className="mt-1 flex-row items-center gap-2">
                            <Text
                              className={`text-sm font-semibold ${ACCOUNT_TYPE_META[selectedAccount.type].accentTextClassName}`}>
                              {ACCOUNT_TYPE_META[selectedAccount.type].label}
                            </Text>
                            <Text className="text-sm text-[#8d9a92]">
                              {selectedAccount.currency} {selectedAccount.balance}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="items-end gap-2">
                        <Badge
                          label="Selected"
                          className="px-2.5 py-1"
                          textClassName="text-[10px] uppercase tracking-[1.3px]"
                        />
                        <Pressable onPress={() => router.push('/account-picker')}>
                          <Text className="text-sm font-semibold text-[#8bff62]">Change</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : null}

                <Pill
                  label={`Browse all ${accounts.length} accounts`}
                  variant="subtle"
                  size="md"
                  className="self-start"
                  onPress={() => router.push('/account-picker')}
                />
              </View>
            ) : (
              <View className="rounded-[24px] border border-dashed border-[#26402f] bg-[#0f1512] p-4">
                <Text className="text-sm leading-6 text-[#7f8c86]">
                  Add at least one account first so this transaction has somewhere to be recorded.
                </Text>
                <Button
                  className="mt-4 h-12 self-start rounded-full bg-[#8bff62] px-5"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push('/account-compose')}>
                  <Text className="text-sm font-semibold text-[#07110a]">Add account</Text>
                </Button>
              </View>
            )}

            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-semibold uppercase tracking-[2.6px] text-[#6f7d74]">
                Category
              </Text>
              <Pill
                label="Browse all"
                variant="subtle"
                size="md"
                className="px-3 py-1.5"
                onPress={() =>
                  router.push({
                    pathname: '/category-picker',
                    params: { type: categoryType },
                  })
                }
              />
            </View>
            {categoriesQuery.isLoading ? (
              <Text className="text-sm text-[#7f8c86]">Loading categories...</Text>
            ) : null}
            <View className="flex-row flex-wrap gap-2.5">
              {quickCategories.map((category) => {
                const isSelected = category.id === selectedCategoryId;

                return (
                  <Pill
                    key={category.id}
                    label={category.name}
                    variant={isSelected ? 'selected' : 'default'}
                    size="md"
                    className={cn(
                      'min-h-11 px-4',
                      isSelected
                        ? 'border-[#8bff62] bg-[#1a2b20] shadow-sm shadow-[#8bff62]/10'
                        : 'bg-[#0f1512]',
                    )}
                    onPress={() => setSelectedCategoryId(category.id)}
                    textStyle={{ color: isSelected ? '#8bff62' : category.colorHex ?? '#dce2de' }}
                  />
                );
              })}
            </View>
            {categories.length > 4 ? (
              <Pill
                label={`Browse all ${categories.length} categories`}
                variant="subtle"
                size="md"
                className="self-start"
                onPress={() =>
                  router.push({
                    pathname: '/category-picker',
                    params: { type: categoryType },
                  })
                }
              />
            ) : null}

            <View className="rounded-[22px] border border-[#17211c] bg-[#0f1512] px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                    Date
                  </Text>
                  <Text className="mt-2 text-base font-semibold text-[#f4f7f5]">{formattedDateLabel}</Text>
                </View>
                <Pressable
                  className="flex-row items-center gap-2 rounded-full bg-[#131b17] px-2.5 py-1"
                  onPress={() => setIsDatePickerOpen((current) => !current)}>
                  <CalendarIcon color="#d7ddd9" size={16} />
                  <Text className="text-[12px] font-medium text-[#d7ddd9]">Change</Text>
                  <ChevronDownIcon color="#d7ddd9" size={16} />
                </Pressable>
              </View>

              {isDatePickerOpen ? (
                <View className="mt-4 rounded-[20px] bg-[#131b17] p-3">
                  <DateTimePicker
                    value={transactionDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date(2100, 11, 31)}
                    themeVariant="dark"
                    textColor="#f4f7f5"
                  />
                  {Platform.OS === 'ios' ? (
                    <Pressable
                      className="mt-3 self-end rounded-full bg-[#8bff62] px-4 py-2"
                      onPress={() => setIsDatePickerOpen(false)}>
                      <Text className="text-sm font-semibold text-[#07110a]">Done</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>

            {createTransactionMutation.isError ? (
              <Text className="text-sm text-[#ff8a94]">
                {createTransactionMutation.error instanceof Error
                  ? createTransactionMutation.error.message
                  : 'Failed to save transaction.'}
              </Text>
            ) : null}

            <Button
              className="h-14 rounded-[22px] bg-[#8bff62]"
              onPress={handleSaveTransaction}
              disabled={!canSave || createTransactionMutation.isPending}>
              <Text className="text-base font-semibold text-[#07110a]">
                {createTransactionMutation.isPending
                  ? `Saving ${mode.toLowerCase()}...`
                  : `Save ${mode.toLowerCase()}`}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
