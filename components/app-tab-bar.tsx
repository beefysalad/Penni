import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { router, usePathname } from 'expo-router';
import {
  BarChart3Icon,
  CreditCardIcon,
  HouseIcon,
  PlusIcon,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

const TABS = [
  { key: 'home', label: 'Home', href: '/', icon: HouseIcon },
  { key: 'accounts', label: 'Accounts', href: '/accounts', icon: CreditCardIcon },
  { key: 'add', label: 'Add', href: '/add', icon: PlusIcon },
  { key: 'stats', label: 'Stats', href: '/stats', icon: BarChart3Icon },
] as const;

type AppTabBarProps = {
  currentTab: (typeof TABS)[number]['key'];
};

export function AppTabBar({ currentTab }: AppTabBarProps) {
  const pathname = usePathname();

  return (
    <View className="pointer-events-box-none absolute inset-x-0 bottom-0 px-4 pb-2 pb-safe">
      <View className="rounded-[28px] border border-[#1d2a20] bg-[#0d1411] px-2 py-2 shadow-sm shadow-black/30">
        <View className="flex-row items-center justify-between gap-2">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.key || pathname === tab.href;

            return (
              <Pressable
                key={tab.key}
                className={cn(
                  'h-[58px] flex-1 items-center justify-center gap-1 rounded-[20px] px-1',
                  isActive ? 'bg-[#8bff62]' : 'bg-transparent'
                )}
                onPress={() => router.replace(tab.href)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${tab.label}`}>
                <Icon
                  as={tab.icon}
                  className={cn('size-[18px]', isActive ? 'text-[#07110a]' : 'text-[#8b9490]')}
                />
                <Text
                  numberOfLines={1}
                  className={cn(
                    'w-full text-center text-[11px] font-semibold',
                    isActive ? 'text-[#07110a]' : 'text-[#8b9490]'
                  )}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
