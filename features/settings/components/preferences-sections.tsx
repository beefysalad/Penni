import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Pressable, Switch, View } from 'react-native';

export function PreferenceSection({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View className="rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
      <Text className="text-[24px] font-semibold text-[#f4f7f5]">{label}</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#7f8c86]">{description}</Text>
      <View className="mt-5">{children}</View>
    </View>
  );
}

export function InlineField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
        {label}
      </Text>
      {children}
    </View>
  );
}

export function OptionRow<T extends string>({
  options,
  value,
  onChange,
  formatOption,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  formatOption?: (option: T) => string;
}) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = option === value;

        return (
          <Pressable
            key={option}
            className={`rounded-full px-4 py-3 ${isSelected ? 'bg-[#8bff62]' : 'bg-[#131b17]'}`}
            onPress={() => onChange(option)}>
            <Text
              className={`text-sm font-semibold ${isSelected ? 'text-[#07110a]' : 'text-[#7f8c86]'}`}>
              {formatOption ? formatOption(option) : option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-4 rounded-[22px] bg-[#131b17] px-4 py-4">
      <View className="flex-1">
        <Text className="text-base font-semibold text-[#f4f7f5]">{label}</Text>
        <Text className="mt-1 text-sm leading-6 text-[#7f8c86]">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2a332d', true: '#8bff62' }}
        thumbColor={value ? '#07110a' : '#d6dbd8'}
      />
    </View>
  );
}

export function MonthlyBudgetGoalField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      keyboardType="number-pad"
      placeholder="20000"
      placeholderTextColor="#6d786f"
      className="h-14 rounded-[18px] border-[#1d2a20] bg-[#111916] px-4 text-white"
    />
  );
}
