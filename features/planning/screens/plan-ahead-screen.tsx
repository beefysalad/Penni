import { Field } from '@/components/forms/field';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreatePlannedItemMutation } from '@/features/finance/hooks/use-planned-items-query';
import { createPlannedItemSchema } from '@/features/finance/lib/finance.schemas';
import type { CategoryType, RecurrenceFrequency } from '@/features/finance/lib/finance.types';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CalendarDaysIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

const ITEM_TYPES = ['Bill', 'Income'] as const;
const RECURRING_OPTIONS = ['Weekly', 'Monthly', 'Quarterly'] as const;

export default function PlanAheadScreen() {
  const createPlannedItemMutation = useCreatePlannedItemMutation();
  const [itemType, setItemType] = useState<(typeof ITEM_TYPES)[number]>('Bill');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurringEvery, setRecurringEvery] =
    useState<(typeof RECURRING_OPTIONS)[number]>('Monthly');
  const [notes, setNotes] = useState('');

  const dueDateLabel = formatDate(dueDate);
  const dateFieldLabel = itemType === 'Bill' ? 'First due date' : 'First payout date';
  const previewDateLabel = itemType === 'Bill' ? 'Due' : 'Payout';

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
    const recurrenceMap: Record<(typeof RECURRING_OPTIONS)[number], RecurrenceFrequency> = {
      Weekly: 'WEEKLY',
      Monthly: 'MONTHLY',
      Quarterly: 'QUARTERLY',
    };

    const parsed = createPlannedItemSchema.safeParse({
      type,
      title: title.trim(),
      notes: notes.trim() || undefined,
      amount: amount.trim(),
      currency: 'PHP',
      startDate: dueDate.toISOString(),
      recurrence: recurrenceMap[recurringEvery],
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

              <View className="mt-5 flex-row gap-3">
                {RECURRING_OPTIONS.map((option) => {
                  const isSelected = option === recurringEvery;

                  return (
                    <Pressable
                      key={option}
                      className={`flex-1 rounded-[18px] border px-2 py-4 ${
                        isSelected
                          ? 'border-[#52d776] bg-[#111c16]'
                          : 'border-[#17211c] bg-[#131b17]'
                      }`}
                      onPress={() => setRecurringEvery(option)}>
                      <Text
                        numberOfLines={1}
                        className={`text-center text-sm font-semibold ${
                          isSelected ? 'text-[#8bff62]' : 'text-[#f4f7f5]'
                        }`}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

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
                {itemType} • {previewDateLabel} {dueDateLabel} • Every{' '}
                {recurringEvery.toLowerCase()}
              </Text>
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
