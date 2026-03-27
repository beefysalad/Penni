import { Field } from '@/components/forms/field';
import { CENTERED_INPUT_STYLE } from '@/components/forms/input-styles';
import { SectionHeader } from '@/components/forms/section-header';
import { SheetHeader } from '@/components/sheets/sheet-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateCategoryMutation } from '@/features/finance/hooks/use-categories-query';
import { slugifyCategoryName } from '@/features/finance/lib/category-utils';
import { CATEGORY_COLORS, CATEGORY_TYPES } from '@/features/finance/lib/constants';
import {
  createCategorySchema,
  type CreateCategoryFormValues,
} from '@/features/finance/lib/finance.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ShapesIcon } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

export default function CategoryComposeScreen() {
  const createCategoryMutation = useCreateCategoryMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      colorHex: CATEGORY_COLORS[0],
    },
  });

  const selectedType = watch('type');
  const selectedColor = watch('colorHex');

  const onSubmit = handleSubmit(async (values) => {
    await createCategoryMutation.mutateAsync({
      name: values.name.trim(),
      slug: slugifyCategoryName(values.name),
      type: values.type,
      colorHex: values.colorHex,
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

          <SheetHeader eyebrow="Categories" title="Create category" />

          <ScrollView
            className="mt-5"
            contentContainerClassName="gap-5 px-5 pb-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
              <View className="items-center rounded-[22px] bg-[#101a14] px-5 py-5">
                <View className="size-14 items-center justify-center rounded-[20px] bg-[#163022]">
                  <ShapesIcon color="#8bff62" size={24} />
                </View>
                <Text className="mt-4 text-[24px] font-semibold text-[#f4f7f5]">
                  New {selectedType.toLowerCase()} category
                </Text>
                <Text className="mt-2 text-center text-[15px] leading-6 text-[#7f8c86]">
                  Create a reusable category so future transactions stay organized.
                </Text>
              </View>

              <View className="mt-5 gap-4">
                <Field label="Category name" error={errors.name?.message}>
                  <View className="rounded-[20px] bg-[#141d18] px-4 py-1 shadow-sm shadow-black/20">
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder="e.g. Groceries"
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
              </View>
            </View>

            <SectionHeader title="Type" actionLabel="Choose one" />
            <View className="flex-row gap-3">
              {CATEGORY_TYPES.map((option) => {
                const isSelected = option.value === selectedType;

                return (
                  <Pressable
                    key={option.value}
                    className={`flex-1 rounded-[20px] border px-4 py-4 ${
                      isSelected ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#0f1512]'
                    }`}
                    onPress={() => setValue('type', option.value, { shouldValidate: true })}>
                    <Text
                      className={`text-center text-base font-semibold ${
                        isSelected ? 'text-[#8bff62]' : 'text-[#f4f7f5]'
                      }`}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionHeader title="Color" actionLabel="Optional" />
            <View className="flex-row flex-wrap gap-4">
              {CATEGORY_COLORS.map((color) => {
                const isSelected = color === selectedColor;

                return (
                  <Pressable
                    key={color}
                    className={`size-14 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-white' : 'border-[#17211c]'
                    }`}
                    style={{ backgroundColor: color }}
                    onPress={() => setValue('colorHex', color, { shouldValidate: true })}
                  />
                );
              })}
            </View>

            {createCategoryMutation.isError ? (
              <Text className="text-sm text-[#ff8a94]">
                {createCategoryMutation.error instanceof Error
                  ? createCategoryMutation.error.message
                  : 'Failed to create category.'}
              </Text>
            ) : null}

            <Button
              className="h-14 rounded-[22px] bg-[#8bff62]"
              onPress={onSubmit}
              disabled={createCategoryMutation.isPending}>
              <Text className="text-base font-semibold text-[#07110a]">
                {createCategoryMutation.isPending ? 'Saving category...' : 'Save category'}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
