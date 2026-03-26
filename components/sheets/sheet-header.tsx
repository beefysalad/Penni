import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { XIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type SheetHeaderProps = {
  eyebrow: string;
  title: string;
};

export function SheetHeader({ eyebrow, title }: SheetHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-4">
      <Pressable
        className="size-11 items-center justify-center rounded-full bg-[#131b17]"
        onPress={() => router.back()}>
        <XIcon color="#eef3ef" size={20} />
      </Pressable>

      <View className="items-center">
        <Text className="text-[11px] font-semibold uppercase tracking-[3px] text-[#8bff62]/75">
          {eyebrow}
        </Text>
        <Text className="mt-1 text-[22px] font-semibold text-[#f4f7f5]">{title}</Text>
      </View>

      <View className="size-11" />
    </View>
  );
}
