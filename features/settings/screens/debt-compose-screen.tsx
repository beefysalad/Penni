import { Field } from '@/components/forms/field';
import { CENTERED_INPUT_STYLE, NUMERIC_INPUT_STYLE } from '@/components/forms/input-styles';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateDebtMutation } from '@/features/finance/hooks/use-debts-query';
import type { DebtDirection } from '@/features/finance/lib/finance.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { HandCoinsIcon } from 'lucide-react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

const debtSchema = z.object({
  direction: z.enum(['I_OWE', 'OWED_TO_ME']),
  title: z.string().trim().min(1, 'Add a debt title.').max(120),
  counterpartyName: z.string().trim().min(1, 'Add a person or counterparty.').max(120),
  originalAmount: z
    .string()
    .trim()
    .min(1, 'Add the amount.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, 'Enter a valid amount.'),
  currency: z.string().trim().min(3).max(3),
  dueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type DebtFormValues = z.infer<typeof debtSchema>;

export default function DebtComposeScreen() {
  const params = useLocalSearchParams<{ direction?: string }>();
  const createDebtMutation = useCreateDebtMutation();
  const initialDirection: DebtDirection =
    params.direction === 'OWED_TO_ME' ? 'OWED_TO_ME' : 'I_OWE';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      direction: initialDirection,
      title: '',
      counterpartyName: '',
      originalAmount: '',
      currency: 'PHP',
      dueDate: '',
      notes: '',
    },
  });

  const direction = useWatch({ control, name: 'direction' });

  const onSubmit = handleSubmit(async (values) => {
    await createDebtMutation.mutateAsync({
      direction: values.direction,
      title: values.title.trim(),
      counterpartyName: values.counterpartyName.trim(),
      originalAmount: Number(values.originalAmount).toFixed(2),
      currency: values.currency.trim().toUpperCase(),
      ...(values.dueDate ? { dueDate: new Date(`${values.dueDate}T00:00:00`).toISOString() } : {}),
      ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
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

          <SheetHeader
            eyebrow="Debt tracker"
            title={direction === 'I_OWE' ? 'New debt' : 'New receivable'}
          />

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-5 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="items-center rounded-[22px] bg-[#101a14] px-5 py-5">
                <View className="size-14 items-center justify-center rounded-[20px] bg-[#1f2217]">
                  <HandCoinsIcon color="#d9f27c" size={24} />
                </View>
                <Text className="mt-4 text-[24px] font-semibold text-[#f4f7f5]">
                  {direction === 'I_OWE' ? 'Track what I owe' : 'Track what comes back'}
                </Text>
                <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                  {direction === 'I_OWE'
                    ? 'Capture money you still need to settle.'
                    : 'Capture money that other people still owe you.'}
                </Text>
              </View>

              <View className="mt-5 gap-3">
                <View className="flex-row gap-3">
                  <Pressable
                    className={`flex-1 rounded-[20px] border p-4 ${
                      direction === 'I_OWE' ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#131b17]'
                    }`}
                    onPress={() =>
                      setValue('direction', 'I_OWE', {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }>
                    <Text className="text-[15px] font-semibold text-[#f4f7f5]">Outstanding debt</Text>
                    <Text className="mt-1 text-xs leading-5 text-[#6d786f]">Money I still need to pay back.</Text>
                  </Pressable>
                  <Pressable
                    className={`flex-1 rounded-[20px] border p-4 ${
                      direction === 'OWED_TO_ME' ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#131b17]'
                    }`}
                    onPress={() =>
                      setValue('direction', 'OWED_TO_ME', {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }>
                    <Text className="text-[15px] font-semibold text-[#f4f7f5]">Incoming debt</Text>
                    <Text className="mt-1 text-xs leading-5 text-[#6d786f]">Money that should still come back.</Text>
                  </Pressable>
                </View>

                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <Field label="Title" error={errors.title?.message}>
                      <TextInput
                        value={field.value}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        placeholder="Laptop advance, Borrowed cash"
                        placeholderTextColor="#536159"
                        className="h-14 rounded-[18px] border border-[#17211c] bg-[#131b17] px-4 text-[16px] font-semibold text-[#f4f7f5]"
                        style={CENTERED_INPUT_STYLE}
                      />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="counterpartyName"
                  render={({ field }) => (
                    <Field
                      label={direction === 'I_OWE' ? 'I owe to' : 'Owed by'}
                      error={errors.counterpartyName?.message}>
                      <TextInput
                        value={field.value}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        placeholder="John, Sarah, Cooperative"
                        placeholderTextColor="#536159"
                        className="h-14 rounded-[18px] border border-[#17211c] bg-[#131b17] px-4 text-[16px] font-semibold text-[#f4f7f5]"
                        style={CENTERED_INPUT_STYLE}
                      />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="originalAmount"
                  render={({ field }) => (
                    <Field label="Amount" error={errors.originalAmount?.message}>
                      <View className="flex-row items-center rounded-[18px] border border-[#17211c] bg-[#131b17] px-4">
                        <Text className="mr-3 text-[22px] font-medium text-[#6f7d74]">₱</Text>
                        <TextInput
                          value={field.value}
                          onBlur={field.onBlur}
                          onChangeText={field.onChange}
                          keyboardType="decimal-pad"
                          placeholder="10000.00"
                          placeholderTextColor="#536159"
                          className="h-14 flex-1 text-[20px] font-semibold text-[#f4f7f5]"
                          style={NUMERIC_INPUT_STYLE}
                        />
                      </View>
                    </Field>
                  )}
                />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="currency"
                      render={({ field }) => (
                        <Field label="Currency" error={errors.currency?.message}>
                          <TextInput
                            value={field.value}
                            onBlur={field.onBlur}
                            onChangeText={field.onChange}
                            placeholder="PHP"
                            autoCapitalize="characters"
                            maxLength={3}
                            placeholderTextColor="#536159"
                            className="h-14 rounded-[18px] border border-[#17211c] bg-[#131b17] px-4 text-[16px] font-semibold text-[#f4f7f5]"
                            style={CENTERED_INPUT_STYLE}
                          />
                        </Field>
                      )}
                    />
                  </View>
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="dueDate"
                      render={({ field }) => (
                        <Field label="Due date" error={errors.dueDate?.message}>
                          <TextInput
                            value={field.value ?? ''}
                            onBlur={field.onBlur}
                            onChangeText={field.onChange}
                            placeholder="Optional"
                            placeholderTextColor="#536159"
                            className="h-14 rounded-[18px] border border-[#17211c] bg-[#131b17] px-4 text-[16px] font-semibold text-[#f4f7f5]"
                            style={CENTERED_INPUT_STYLE}
                          />
                        </Field>
                      )}
                    />
                  </View>
                </View>

                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <Field label="Notes" error={errors.notes?.message}>
                      <TextInput
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        placeholder="Optional reminders or context"
                        placeholderTextColor="#536159"
                        multiline
                        textAlignVertical="top"
                        className="min-h-[108px] rounded-[18px] border border-[#17211c] bg-[#131b17] px-4 py-4 text-[15px] leading-6 font-medium text-[#f4f7f5]"
                      />
                    </Field>
                  )}
                />
              </View>
            </View>

            {createDebtMutation.isError ? (
              <Text className="text-sm text-[#ff8a94]">
                {createDebtMutation.error instanceof Error
                  ? createDebtMutation.error.message
                  : 'Failed to save debt.'}
              </Text>
            ) : null}

            <Button
              className="h-14 rounded-[22px] bg-[#8bff62]"
              onPress={onSubmit}
              disabled={createDebtMutation.isPending}>
              <Text className="text-base font-semibold text-[#07110a]">
                {createDebtMutation.isPending
                  ? direction === 'I_OWE'
                    ? 'Saving debt...'
                    : 'Saving receivable...'
                  : direction === 'I_OWE'
                    ? 'Save debt'
                    : 'Save receivable'}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
