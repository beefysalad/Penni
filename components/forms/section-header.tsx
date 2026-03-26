import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
};

export function SectionHeader({ title, actionLabel }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[12px] font-semibold uppercase tracking-[2.6px] text-[#6f7d74]">
        {title}
      </Text>
      {actionLabel ? (
        <Text className="text-sm font-medium text-[#8bff62]/80">{actionLabel}</Text>
      ) : null}
    </View>
  );
}
