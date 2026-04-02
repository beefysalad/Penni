import { Field } from '@/components/forms/field';
import {
  CENTERED_INPUT_STYLE,
  NUMERIC_INPUT_STYLE,
} from '@/components/forms/input-styles';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchInput } from '@/components/ui/search-input';
import { Text } from '@/components/ui/text';
import { ACCOUNT_TYPE_META } from '@/features/finance/lib/constants';
import { useAccountsQuery } from '@/features/finance/hooks/use-accounts-query';
import { useCreatePlannedItemMutation } from '@/features/finance/hooks/use-planned-items-query';
import { createPlannedItemSchema } from '@/features/finance/lib/finance.schemas';
import { formatDueDayOfMonth, formatRecurrencePhrase } from '@/features/finance/lib/formatters';
import { getPrimaryAssetAccount } from '@/features/finance/lib/selectors';
import type { CategoryType, RecurrenceFrequency } from '@/features/finance/lib/finance.types';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { TriggerRef } from '@rn-primitives/popover';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CalendarDaysIcon, CheckIcon, ChevronDownIcon, Wallet2Icon, WalletCardsIcon, XIcon } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

const ITEM_TYPES = ['Bill', 'Income'] as const;
const RECURRING_OPTIONS = ['Weekly', 'Monthly', 'Semi-monthly', 'Quarterly', 'Yearly'] as const;
const RECURRENCE_MAP: Record<(typeof RECURRING_OPTIONS)[number], RecurrenceFrequency> = {
  Weekly: 'WEEKLY',
  Monthly: 'MONTHLY',
  'Semi-monthly': 'SEMI_MONTHLY',
  Quarterly: 'QUARTERLY',
  Yearly: 'YEARLY',
};

export default function PlanAheadScreen() {
  const createPlannedItemMutation = useCreatePlannedItemMutation();
  const accountsQuery = useAccountsQuery();
  const cadenceTriggerRef = useRef<TriggerRef>(null);
  const accountTriggerRef = useRef<TriggerRef>(null);
  const [itemType, setItemType] = useState<(typeof ITEM_TYPES)[number]>('Bill');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurringEvery, setRecurringEvery] =
    useState<(typeof RECURRING_OPTIONS)[number]>('Monthly');
  const [semiMonthlyFirstDay, setSemiMonthlyFirstDay] = useState('15');
  const [semiMonthlySecondDay, setSemiMonthlySecondDay] = useState('30');
  const [notes, setNotes] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState('');
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);

  const accounts = accountsQuery.data ?? [];
  const preferredIncomeAccount = useMemo(
    () => getPrimaryAssetAccount(accounts) ?? accounts[0] ?? null,
    [accounts],
  );
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? null;
  const filteredAccounts = useMemo(() => {
    const query = accountSearch.trim().toLowerCase();

    if (!query) {
      return accounts;
    }

    return accounts.filter((account) =>
      `${account.name} ${account.type} ${account.currency}`.toLowerCase().includes(query),
    );
  }, [accounts, accountSearch]);
  const dueDateLabel = formatDate(dueDate);
  const dateFieldLabel = itemType === 'Bill' ? 'First due date' : 'First payout date';
  const previewDateLabel = itemType === 'Bill' ? 'Due' : 'Payout';
  const accountFieldLabel = itemType === 'Bill' ? 'Pay from' : 'Deposit into';

  useEffect(() => {
    if (itemType === 'Income' && !selectedAccountId && preferredIncomeAccount) {
      setSelectedAccountId(preferredIncomeAccount.id);
    }
  }, [itemType, preferredIncomeAccount, selectedAccountId]);

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setDueDate(selectedDate);
    }
  }

  async function handleSavePlannedItem() {
    const type: CategoryType = itemType === 'Bill' ? 'EXPENSE' : 'INCOME';
    const semiMonthlyDays =
      recurringEvery === 'Semi-monthly'
        ? [Number(semiMonthlyFirstDay), Number(semiMonthlySecondDay)].filter((day) =>
            Number.isInteger(day),
          )
        : undefined;

    const parsed = createPlannedItemSchema.safeParse({
      accountId: selectedAccountId ?? undefined,
      type,
      title: title.trim(),
      notes: notes.trim() || undefined,
      amount: amount.trim(),
      currency: 'PHP',
      startDate: dueDate.toISOString(),
      recurrence: RECURRENCE_MAP[recurringEvery],
      semiMonthlyDays,
    });

    if (!parsed.success) {
      return;
    }

    await createPlannedItemMutation.mutateAsync(parsed.data);
    router.back();
  }

  return (
    <View className="flex-1 bg-black/50">
      <StatusBar style="light" />
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={() => router.back()} />

        <View className="max-h-[90%] rounded-t-[34px] border-t border-[#1b2a21] bg-[#0b120e] pb-8 shadow-2xl shadow-black/60">
          <View className="items-center pt-3">
            <View className="h-1.5 w-16 rounded-full bg-[#2a392f]" />
          </View>

          <SheetHeader eyebrow="Recurring" title="Create planned item" />

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-5 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-4">
              <View className="flex-row gap-3 rounded-[22px] bg-[#131b17] p-2">
                {ITEM_TYPES.map((type) => {
                  const isSelected = type === itemType;

                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      className={`h-12 flex-1 rounded-[18px] ${
                        isSelected ? 'bg-[#8bff62]' : 'bg-transparent'
                      }`}
                      onPress={() => setItemType(type)}>
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected ? 'text-[#07110a]' : 'text-[#7f8c86]'
                        }`}>
                        {type}
                      </Text>
                    </Button>
                  );
                })}
              </View>
            </View>

            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="text-sm leading-6 text-[#7f8c86]">
                Set the amount, first date, and repeat cadence.
              </Text>

              <View className="mt-4 gap-4">
                <Field label={`${itemType} name`}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={itemType === 'Bill' ? 'e.g. Globe postpaid' : 'e.g. Salary payout'}
                    placeholderTextColor="#728178"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="off"
                    className="h-12 rounded-[18px] bg-[#141d18] px-4 text-[16px] text-[#f4f7f5]"
                    style={CENTERED_INPUT_STYLE}
                  />
                </Field>

                <Field label="Amount">
                  <View className="flex-row items-center rounded-[18px] bg-[#141d18] px-4">
                    <Text className="mr-3 text-[22px] font-medium text-[#7a897f]">₱</Text>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#728178"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="off"
                      className="h-12 flex-1 bg-transparent px-0 text-[20px] font-semibold text-[#f4f7f5]"
                      style={NUMERIC_INPUT_STYLE}
                    />
                  </View>
                </Field>

                <Field label={dateFieldLabel}>
                  <Pressable
                    className="flex-row items-center rounded-[18px] bg-[#141d18] px-4 py-4"
                    onPress={() => setShowDatePicker(true)}>
                    <CalendarDaysIcon color="#8bff62" size={18} />
                    <Text
                      className={`ml-3 text-[16px] ${
                        dueDate ? 'text-[#f4f7f5]' : 'text-[#728178]'
                      }`}>
                      {dueDateLabel}
                    </Text>
                  </Pressable>
                </Field>
              </View>

              <View className="mt-5">
                <Field label={accountFieldLabel}>
                  {selectedAccount ? (
                    <View className="gap-2.5">
                      <View className="rounded-[22px] border border-[#2a3b31] bg-[#141d18] p-4">
                        <View className="flex-row items-center justify-between gap-3">
                          <View className="flex-row items-center gap-3">
                            <View
                              className={`size-11 items-center justify-center rounded-2xl ${ACCOUNT_TYPE_META[selectedAccount.type].iconWrapClassName}`}>
                              <Wallet2Icon color="#8bff62" size={18} />
                            </View>
                            <View>
                              <Text className="text-[16px] font-semibold text-[#f4f7f5]">
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
                          <Pressable onPress={() => setIsAccountPickerOpen(true)}>
                            <Text className="text-sm font-semibold text-[#8bff62]">Change</Text>
                          </Pressable>
                        </View>
                      </View>

                      <Pressable
                        className="self-start rounded-full bg-[#141d18] px-4 py-2.5"
                        onPress={() => setIsAccountPickerOpen(true)}>
                        <Text className="text-xs font-semibold text-[#dce2de]">
                          Browse all accounts
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View className="gap-3 rounded-[20px] border border-dashed border-[#26402f] bg-[#141d18] p-4">
                      <Text className="text-sm leading-6 text-[#7f8c86]">
                        {itemType === 'Income'
                          ? 'Choose where this recurring income should land.'
                          : 'Link an account if this bill should be tied to a specific source.'}
                      </Text>
                      <View className="flex-row gap-2">
                        <Button
                          className="h-11 self-start rounded-full bg-[#8bff62] px-5"
                          variant="ghost"
                          size="sm"
                          onPress={() => setIsAccountPickerOpen(true)}>
                          <Text className="text-sm font-semibold text-[#07110a]">
                            Choose account
                          </Text>
                        </Button>
                        {itemType === 'Bill' ? (
                          <Button
                            className="h-11 self-start rounded-full bg-[#131b17] px-5"
                            variant="ghost"
                            size="sm"
                            onPress={() => setSelectedAccountId(null)}>
                            <Text className="text-sm font-semibold text-[#dce2de]">Skip for now</Text>
                          </Button>
                        ) : null}
                      </View>
                    </View>
                  )}
                </Field>
              </View>

              <View className="mt-5">
                <Field label="Repeat every">
                  <Popover>
                    <PopoverTrigger asChild ref={cadenceTriggerRef}>
                      <Pressable className="flex-row items-center justify-between rounded-[18px] bg-[#141d18] px-4 py-4">
                      <Text className="text-[16px] font-medium text-[#f4f7f5]">
                        {recurringEvery}
                      </Text>
                      <ChevronDownIcon color="#93a19a" size={18} />
                    </Pressable>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-64 rounded-[20px] border border-[#17211c] bg-[#0f1512] p-2">
                    <View className="gap-1">
                      {RECURRING_OPTIONS.map((option) => {
                        const isSelected = option === recurringEvery;

                        return (
                          <Pressable
                            key={option}
                            className={`flex-row items-center justify-between rounded-[14px] px-4 py-3 ${
                              isSelected ? 'bg-[#111c16]' : 'bg-transparent'
                            }`}
                            onPress={() => {
                              setRecurringEvery(option);
                              cadenceTriggerRef.current?.close();
                            }}>
                            <Text
                              className={`text-sm font-semibold ${
                                isSelected ? 'text-[#8bff62]' : 'text-[#f4f7f5]'
                              }`}>
                              {option}
                            </Text>
                            {isSelected ? <CheckIcon color="#8bff62" size={16} /> : null}
                          </Pressable>
                        );
                      })}
                    </View>
                    </PopoverContent>
                  </Popover>
                </Field>
              </View>

              {recurringEvery === 'Semi-monthly' ? (
                <View className="mt-4 rounded-[20px] bg-[#141d18] p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                    Payout days
                  </Text>
                  <View className="mt-3 flex-row gap-3">
                    <View className="flex-1">
                      <Text className="mb-2 text-xs font-medium text-[#93a19a]">First day</Text>
                      <TextInput
                        value={semiMonthlyFirstDay}
                        onChangeText={setSemiMonthlyFirstDay}
                        keyboardType="number-pad"
                        placeholder="15"
                        placeholderTextColor="#728178"
                        maxLength={2}
                        className="h-12 rounded-[16px] bg-[#101713] px-4 text-[16px] text-[#f4f7f5]"
                        style={CENTERED_INPUT_STYLE}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-2 text-xs font-medium text-[#93a19a]">Second day</Text>
                      <TextInput
                        value={semiMonthlySecondDay}
                        onChangeText={setSemiMonthlySecondDay}
                        keyboardType="number-pad"
                        placeholder="30"
                        placeholderTextColor="#728178"
                        maxLength={2}
                        className="h-12 rounded-[16px] bg-[#101713] px-4 text-[16px] text-[#f4f7f5]"
                        style={CENTERED_INPUT_STYLE}
                      />
                    </View>
                  </View>
                </View>
              ) : null}

              {showDatePicker ? (
                <View className="mt-4 overflow-hidden rounded-[20px] bg-[#141d18] px-2 pt-2">
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor="#f4f7f5"
                    accentColor="#8bff62"
                    themeVariant="dark"
                  />

                  {Platform.OS === 'ios' ? (
                    <View className="border-t border-[#1c2721] px-2 py-3">
                      <Button
                        variant="ghost"
                        className="h-11 rounded-[16px] bg-[#8bff62]"
                        onPress={() => setShowDatePicker(false)}>
                        <Text className="text-sm font-semibold text-[#07110a]">Done</Text>
                      </Button>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <Field label="Notes">
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Optional note for future you"
                  placeholderTextColor="#728178"
                  multiline
                  textAlignVertical="top"
                  className="min-h-[110px] rounded-[20px] bg-[#141d18] px-4 py-4 text-[16px] leading-6 text-[#f4f7f5]"
                />
              </Field>
            </View>

            <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                Preview
              </Text>
              <Text className="mt-3 text-lg font-semibold text-[#f4f7f5]">
                {title || `${itemType} name`}
              </Text>
              <Text className="mt-1 text-sm text-[#7f8c86]">
                {itemType} • {previewDateLabel} {dueDateLabel} •{' '}
                {formatRecurrencePhrase(RECURRENCE_MAP[recurringEvery], recurringEvery === 'Semi-monthly'
                  ? [Number(semiMonthlyFirstDay), Number(semiMonthlySecondDay)].filter((day) => Number.isInteger(day))
                  : undefined)}
              </Text>
              {selectedAccount ? (
                <Text className="mt-2 text-xs text-[#93a19a]">
                  {itemType === 'Bill' ? 'Pays from' : 'Deposits into'} {selectedAccount.name}
                </Text>
              ) : null}
              {recurringEvery === 'Semi-monthly' ? (
                <Text className="mt-2 text-xs text-[#93a19a]">
                  {formatDueDayOfMonth(Number(semiMonthlyFirstDay)) ?? '--'} and{' '}
                  {formatDueDayOfMonth(Number(semiMonthlySecondDay)) ?? '--'} each month
                </Text>
              ) : null}
              <Text className="mt-4 text-[30px] font-semibold text-[#8bff62]">
                ₱{amount || '0.00'}
              </Text>
            </View>

            {createPlannedItemMutation.isError ? (
              <Text className="text-sm text-[#ff8a94]">
                {createPlannedItemMutation.error instanceof Error
                  ? createPlannedItemMutation.error.message
                  : 'Failed to save recurring item.'}
              </Text>
            ) : null}

            <Button
              className="h-13 rounded-[20px] bg-[#8bff62]"
              onPress={handleSavePlannedItem}
              disabled={createPlannedItemMutation.isPending}>
              <Text className="text-sm font-semibold text-[#07110a]">
                {createPlannedItemMutation.isPending ? 'Saving recurring item...' : 'Save recurring item'}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>

      {isAccountPickerOpen ? (
        <View className="absolute inset-0 bg-black/65">
          <Pressable className="flex-1" onPress={() => setIsAccountPickerOpen(false)} />

          <View className="max-h-[82%] rounded-t-[34px] border-t border-[#1b2a21] bg-[#0b120e] pb-8 shadow-2xl shadow-black/60">
            <View className="items-center pt-3">
              <View className="h-1.5 w-16 rounded-full bg-[#2a392f]" />
            </View>

            <View className="flex-row items-center justify-between px-5 pt-4">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-[2.4px] text-[#8bff62]/70">
                  Accounts
                </Text>
                <Text className="mt-2 text-[28px] font-semibold leading-[34px] text-white">
                  Select account
                </Text>
              </View>
              <Pressable
                className="size-11 items-center justify-center rounded-full bg-[#111916]"
                onPress={() => setIsAccountPickerOpen(false)}>
                <XIcon color="#f4f7f5" size={20} />
              </Pressable>
            </View>

            <ScrollView
              className="mt-5"
              contentContainerClassName="gap-5 px-5 pb-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <SearchInput
                value={accountSearch}
                onChangeText={setAccountSearch}
                placeholder="Search accounts"
              />

              {itemType === 'Bill' ? (
                <Pressable
                  className={`rounded-[20px] border px-4 py-4 ${
                    !selectedAccountId ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#131b17]'
                  }`}
                  onPress={() => {
                    setSelectedAccountId(null);
                    setIsAccountPickerOpen(false);
                  }}>
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className={`text-base font-semibold ${!selectedAccountId ? 'text-[#8bff62]' : 'text-[#f4f7f5]'}`}>
                      No linked account
                    </Text>
                    {!selectedAccountId ? <CheckIcon color="#8bff62" size={16} /> : null}
                  </View>
                </Pressable>
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
                        setIsAccountPickerOpen(false);
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
      ) : null}
    </View>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
