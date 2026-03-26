import { SheetHeader } from '@/components/sheets/sheet-header';
import { Text } from '@/components/ui/text';
import { useCategoriesQuery } from '@/features/finance/hooks/use-categories-query';
import { useTransactionCompose } from '@/features/finance/lib/transaction-compose-context';
import type { CategoryType } from '@/features/finance/lib/finance.types';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

export default function CategoryPickerScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const categoryType: CategoryType = params.type === 'INCOME' ? 'INCOME' : 'EXPENSE';
  const categoriesQuery = useCategoriesQuery({ type: categoryType });
  const { selectedCategoryId, setSelectedCategoryId } = useTransactionCompose();
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    const categories = categoriesQuery.data ?? [];
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categoriesQuery.data, search]);

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

          <SheetHeader eyebrow="Categories" title="Select category" />

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
                placeholder="Search categories"
                placeholderTextColor="#6d786f"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                className="h-12 flex-1 bg-transparent px-0 text-[16px] text-[#f4f7f5]"
              />
            </View>

            {categoriesQuery.isLoading ? (
              <Text className="text-sm text-[#7f8c86]">Loading categories...</Text>
            ) : null}

            <View className="gap-3">
              {filteredCategories.map((category) => {
                const isSelected = category.id === selectedCategoryId;

                return (
                  <Pressable
                    key={category.id}
                    className={`rounded-[20px] border px-4 py-4 ${
                      isSelected ? 'border-[#52d776] bg-[#111c16]' : 'border-[#17211c] bg-[#131b17]'
                    }`}
                    onPress={() => {
                      setSelectedCategoryId(category.id);
                      router.back();
                    }}>
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-row items-center gap-3">
                        <View
                          className="size-3 rounded-full"
                          style={{ backgroundColor: category.colorHex ?? '#dce2de' }}
                        />
                        <Text className="text-base font-semibold text-[#f4f7f5]">{category.name}</Text>
                      </View>
                      {isSelected ? (
                        <Text className="text-sm font-semibold text-[#8bff62]">Selected</Text>
                      ) : null}
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
