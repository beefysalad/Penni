import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ChevronRightIcon, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export type SettingsItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  href: string;
};

export function SettingsRow({ item }: { item: SettingsItem }) {
  return (
    <Pressable
      className="flex-row items-center gap-3 rounded-[20px] bg-[#131b17] px-4 py-3.5"
      onPress={() => router.push(item.href as never)}>
      <View className={`size-10 items-center justify-center rounded-[14px] ${item.iconBg}`}>
        <item.icon color={item.iconColor} size={18} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-[#f4f7f5]">{item.label}</Text>
        <Text className="mt-0.5 text-xs text-[#6d786f]">{item.description}</Text>
      </View>
      <ChevronRightIcon color="#4a5650" size={18} />
    </Pressable>
  );
}
