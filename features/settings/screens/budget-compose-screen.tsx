import { Field } from '@/components/forms/field';
import { SectionHeader } from '@/components/forms/section-header';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  createBudgetSchema,
  type CreateBudgetFormValues,
} from '@/features/finance/lib/finance.schemas';
import { useCreateBudgetMutation } from '@/features/finance/hooks/use-budgets-query';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { formatPeriod } from '@/features/finance/lib/formatters';
import { endOfMonth, startOfMonth } from '@/features/settings/lib/budget-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { GoalIcon } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BudgetComposeScreen() {
  const createBudgetMutation = useCreateBudgetMutation();
  const categoriesQuery = useCategoriesQuery({ type: 'EXPENSE' });
  const expenseCategories = categoriesQuery.data ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: '',
      amount: '',
      currency: 'PHP',
      alertThreshold: 80,
      periodStart: startOfMonth(),
      periodEnd: endOfMonth(),
      categoryId: undefined,
    },
  });

  const selectedCategoryId = watch('categoryId');
  const periodStart = watch('periodStart');
  const periodEnd = watch('periodEnd');

  const onSubmit = handleSubmit(async (values) => {
    await createBudgetMutation.mutateAsync({
      name: values.name.trim(),
      amount: values.amount.trim(),
      currency: values.currency.trim().toUpperCase(),
      alertThreshold: values.alertThreshold,
      periodStart: values.periodStart,
      periodEnd: values.periodEnd,
      categoryId: values.categoryId || undefined,
    });

    router.back();
  });

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

          <SheetHeader eyebrow="Budget planning" title="New budget" />

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-5 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="items-center rounded-[22px] bg-[#101a14] px-5 py-5">
                <View className="size-14 items-center justify-center rounded-[20px] bg-[#2a2518]">
                  <GoalIcon color="#ffc857" size={24} />
                </View>
                <Text className="mt-4 text-[24px] font-semibold text-[#f4f7f5]">
                  Set a limit
                </Text>
                <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                  Choose a name, cap, and period. We'll track spend against it automatically.
                </Text>
              </View>

              <View className="mt-5 gap-4">
                <Field label="Budget name" error={errors.name?.message}>
                  <View className="rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder="Food & dining, Transport, Shopping"
                          placeholderTextColor="#6f7d74"
                          autoCorrect={false}
                          spellCheck={false}
                          autoComplete="off"
                          className="h-12 bg-transparent px-0 text-[17px] text-[#f4f7f5]"
                          style={{
                            lineHeight: 20,
                            paddingVertical: 0,
                            textAlignVertical: 'center',
                            includeFontPadding: false,
                          }}
                        />
                      )}
                    />
                  </View>
                </Field>

                <Field label="Monthly limit" error={errors.amount?.message}>
                  <View className="flex-row items-center rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                    <Text className="mr-3 text-[22px] font-medium text-[#6f7d74]">₱</Text>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          keyboardType="decimal-pad"
                          placeholder="5000.00"
                          placeholderTextColor="#6f7d74"
                          autoCorrect={false}
                          spellCheck={false}
                          autoComplete="off"
                          className="h-12 flex-1 bg-transparent px-0 text-[22px] font-semibold text-[#f4f7f5]"
                          style={{
                            lineHeight: 24,
                            paddingVertical: 0,
                            textAlignVertical: 'center',
                            includeFontPadding: false,
                          }}
                        />
                      )}
                    />
                  </View>
                </Field>
              </View>
            </View>

            {/* Period */}
            <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] px-4 py-4">
              <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                Period
              </Text>
              <Text className="mt-2 text-base font-semibold text-[#f4f7f5]">
                {formatPeriod(periodStart, periodEnd)}
              </Text>
              <Text className="mt-1 text-sm leading-6 text-[#7f8c86]">
                Defaults to the current calendar month. Custom periods coming soon.
              </Text>
            </View>

            {/* Category (optional) */}
            {expenseCategories.length > 0 ? (
              <>
                <SectionHeader title="Category (optional)" actionLabel="Link to a category" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-3">
                  {expenseCategories.map((category) => {
                    const isSelected = category.id === selectedCategoryId;

                    return (
                      <Pressable
                        key={category.id}
                        className={`rounded-full border px-4 py-3 ${
                          isSelected ? 'border-[#ffc857] bg-[#2a2518]' : 'border-[#17211c] bg-[#0f1512]'
                        }`}
                        onPress={() =>
                          setValue('categoryId', isSelected ? undefined : category.id, {
                            shouldValidate: true,
                          })
                        }>
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected ? 'text-[#ffc857]' : 'text-[#dce2de]'
                          }`}>
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}

            {createBudgetMutation.isError ? (
              <Text className="text-sm text-[#ff8a94]">
                {createBudgetMutation.error instanceof Error
                  ? createBudgetMutation.error.message
                  : 'Failed to create budget.'}
              </Text>
            ) : null}

            <Button
              className="h-14 rounded-[22px] bg-[#ffc857]"
              onPress={onSubmit}
              disabled={createBudgetMutation.isPending}>
              <Text className="text-base font-semibold text-[#07110a]">
                {createBudgetMutation.isPending ? 'Creating budget...' : 'Create budget'}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
