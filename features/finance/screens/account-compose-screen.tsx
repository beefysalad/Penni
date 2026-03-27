import { Field } from '@/components/forms/field';
import {
  CENTERED_INPUT_STYLE,
  NUMERIC_INPUT_STYLE,
} from '@/components/forms/input-styles';
import { SectionHeader } from '@/components/forms/section-header';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  createAccountSchema,
  type CreateAccountFormValues,
} from '@/features/finance/lib/finance.schemas';
import { useCreateAccountMutation } from '@/features/finance/hooks/use-accounts-query';
import {
  ACCOUNT_CURRENCY_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from '@/features/finance/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Building2Icon, Wallet2Icon } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

export default function AccountComposeScreen() {
  const params = useLocalSearchParams<{ type?: string; name?: string }>();
  const createAccountMutation = useCreateAccountMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: typeof params.name === 'string' ? params.name : '',
      balance: '',
      type:
        params.type === 'CASH' ||
        params.type === 'BANK_ACCOUNT' ||
        params.type === 'E_WALLET' ||
        params.type === 'CREDIT_CARD' ||
        params.type === 'OTHER'
          ? params.type
          : 'E_WALLET',
      currency: 'PHP',
      institutionName: '',
      creditLimit: '',
      availableCredit: '',
      dueDayOfMonth: '',
    },
  });

  const selectedType = watch('type');
  const selectedCurrency = watch('currency');
  const creditLimit = watch('creditLimit');
  const availableCredit = watch('availableCredit');
  const isCreditCard = selectedType === 'CREDIT_CARD';

  const derivedCardBalance =
    isCreditCard && creditLimit?.trim() && availableCredit?.trim()
      ? Number(creditLimit) - Number(availableCredit)
      : null;

  const onSubmit = handleSubmit(async (values) => {
    const balance =
      values.type === 'CREDIT_CARD'
        ? `${Math.max(
            0,
            Number(values.creditLimit?.trim() ?? '0') - Number(values.availableCredit?.trim() ?? '0'),
          )}`
        : values.balance.trim();

    await createAccountMutation.mutateAsync({
      name: values.name.trim(),
      balance,
      type: values.type,
      currency: values.currency.trim().toUpperCase(),
      institutionName: values.institutionName?.trim() || undefined,
      creditLimit: values.creditLimit?.trim() || undefined,
      availableCredit: values.availableCredit?.trim() || undefined,
      dueDayOfMonth: values.dueDayOfMonth?.trim()
        ? Number(values.dueDayOfMonth.trim())
        : undefined,
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
                  New {selectedType.toLowerCase().replace('_', ' ')}
                </Text>
                <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                  Add a real account so balances and future transactions have somewhere to land.
                </Text>
              </View>

              <View className="mt-5 gap-4">
                <Field label="Account name" error={errors.name?.message}>
                  <View className="rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder="GCash, BPI Savings, Cash Wallet"
                          placeholderTextColor="#6f7d74"
                          autoCorrect={false}
                          spellCheck={false}
                          autoComplete="off"
                          className="h-12 bg-transparent px-0 text-[17px] text-[#f4f7f5]"
                          style={CENTERED_INPUT_STYLE}
                        />
                      )}
                    />
                  </View>
                </Field>

                {!isCreditCard ? (
                  <Field label="Starting balance" error={errors.balance?.message}>
                    <View className="flex-row items-center rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                      <Text className="mr-3 text-[22px] font-medium text-[#6f7d74]">₱</Text>
                      <Controller
                        control={control}
                        name="balance"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor="#6f7d74"
                            autoCorrect={false}
                            spellCheck={false}
                            autoComplete="off"
                            className="h-12 flex-1 bg-transparent px-0 text-[22px] font-semibold text-[#f4f7f5]"
                            style={NUMERIC_INPUT_STYLE}
                          />
                        )}
                      />
                    </View>
                  </Field>
                ) : null}

                {isCreditCard ? (
                  <>
                    <Field label="Total limit" error={errors.creditLimit?.message}>
                      <View className="flex-row items-center rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                        <Text className="mr-3 text-[22px] font-medium text-[#6f7d74]">₱</Text>
                        <Controller
                          control={control}
                          name="creditLimit"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              keyboardType="decimal-pad"
                              placeholder="0.00"
                              placeholderTextColor="#6f7d74"
                              autoCorrect={false}
                              spellCheck={false}
                              autoComplete="off"
                              className="h-12 flex-1 bg-transparent px-0 text-[22px] font-semibold text-[#f4f7f5]"
                              style={NUMERIC_INPUT_STYLE}
                            />
                          )}
                        />
                      </View>
                    </Field>

                    <Field label="Available limit" error={errors.availableCredit?.message}>
                      <View className="flex-row items-center rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                        <Text className="mr-3 text-[22px] font-medium text-[#6f7d74]">₱</Text>
                        <Controller
                          control={control}
                          name="availableCredit"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              keyboardType="decimal-pad"
                              placeholder="0.00"
                              placeholderTextColor="#6f7d74"
                              autoCorrect={false}
                              spellCheck={false}
                              autoComplete="off"
                              className="h-12 flex-1 bg-transparent px-0 text-[22px] font-semibold text-[#f4f7f5]"
                              style={NUMERIC_INPUT_STYLE}
                            />
                          )}
                        />
                      </View>
                    </Field>

                    <Field label="Due day" error={errors.dueDayOfMonth?.message}>
                      <View className="rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                        <Controller
                          control={control}
                          name="dueDayOfMonth"
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              keyboardType="number-pad"
                              placeholder="e.g. 16"
                              placeholderTextColor="#6f7d74"
                              autoCorrect={false}
                              spellCheck={false}
                              autoComplete="off"
                              className="h-12 bg-transparent px-0 text-[17px] text-[#f4f7f5]"
                              style={CENTERED_INPUT_STYLE}
                            />
                          )}
                        />
                      </View>
                    </Field>

                    <View className="rounded-[20px] border border-[#203326] bg-[#111c16] px-4 py-4">
                      <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-[#6f7d74]">
                        Current balance owed
                      </Text>
                      <Text className="mt-2 text-[24px] font-semibold text-[#f4f7f5]">
                        {derivedCardBalance !== null
                          ? `₱${derivedCardBalance.toFixed(2)}`
                          : 'Waiting on limit details'}
                      </Text>
                      <Text className="mt-1 text-sm leading-6 text-[#7f8c86]">
                        Penni derives this from total limit minus available credit.
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            <SectionHeader title="Type" actionLabel="Choose one" />
            <View className="flex-row flex-wrap gap-3">
              {ACCOUNT_TYPE_OPTIONS.map((option) => {
                const isSelected = option.value === selectedType;

                return (
                  <Pressable
                    key={option.value}
                    className={`rounded-full border px-4 py-3 ${
                      isSelected ? 'border-[#8bff62] bg-[#1f3526]' : 'border-[#17211c] bg-[#0f1512]'
                    }`}
                    onPress={() => setValue('type', option.value, { shouldValidate: true })}>
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-[#8bff62]' : 'text-[#dce2de]'
                      }`}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionHeader title="Currency" actionLabel="Default" />
            <View className="flex-row gap-3">
              {ACCOUNT_CURRENCY_OPTIONS.map((currency) => {
                const isSelected = currency === selectedCurrency;

                return (
                  <Pressable
                    key={currency}
                    className={`flex-1 rounded-[20px] border px-4 py-4 ${
                      isSelected ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#0f1512]'
                    }`}
                    onPress={() => setValue('currency', currency, { shouldValidate: true })}>
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
                    {isCreditCard ? 'Card details stay manual for now' : 'No institution needed here'}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-[#7f8c86]">
                    {isCreditCard
                      ? 'Enter the card balance, total limit, available limit, and due day so Penni can track it properly.'
                      : 'We are creating a manual account entry for now, so the app does not need a bank connector yet.'}
                  </Text>
                </View>
              </View>
            </View>

            {createAccountMutation.isError ? (
              <Text className="text-sm text-[#ff8a94]">
                {createAccountMutation.error instanceof Error
                  ? createAccountMutation.error.message
                  : 'Failed to create account.'}
              </Text>
            ) : null}

            <Button
              className="h-14 rounded-[22px] bg-[#8bff62]"
              onPress={onSubmit}
              disabled={createAccountMutation.isPending}>
              <Text className="text-base font-semibold text-[#07110a]">
                {createAccountMutation.isPending ? 'Saving account...' : 'Save account'}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
