import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
        {label}
      </Text>
      <Text className="mt-3 text-base font-semibold text-[#f4f7f5]">{value}</Text>
    </View>
  );
}
