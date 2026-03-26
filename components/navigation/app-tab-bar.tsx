import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { router, usePathname } from 'expo-router';
import {
  BarChart3Icon,
  CreditCardIcon,
  HouseIcon,
  ReceiptTextIcon,
  UserRoundIcon,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

const TABS = [
  { key: 'home', label: 'Home', href: '/', icon: HouseIcon },
  { key: 'accounts', label: 'Accounts', href: '/accounts', icon: CreditCardIcon },
  { key: 'activity', label: 'Activity', href: '/add', icon: ReceiptTextIcon },
  { key: 'stats', label: 'Stats', href: '/stats', icon: BarChart3Icon },
  { key: 'profile', label: 'Profile', href: '/settings', icon: UserRoundIcon },
] as const;

type AppTabBarProps = {
  currentTab: (typeof TABS)[number]['key'];
};

export function AppTabBar({ currentTab }: AppTabBarProps) {
  const pathname = usePathname();

  return (
    <View className="absolute inset-x-0 bottom-0 border-t border-[#162019] bg-[#08100c] pb-safe pt-2">
      <View className="flex-row items-center justify-between gap-1 px-2 pb-2">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.key || pathname === tab.href;

            return (
              <Pressable
                key={tab.key}
                className={cn(
                  'h-[54px] flex-1 items-center justify-center gap-1 rounded-[16px] px-1',
                  isActive ? 'bg-[#8bff62]' : 'bg-transparent'
                )}
                onPress={() => router.replace(tab.href)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${tab.label}`}>
                <Icon
                  as={tab.icon}
                  className={cn('size-[17px]', isActive ? 'text-[#07110a]' : 'text-[#8b9490]')}
                />
                <Text
                  numberOfLines={1}
                  className={cn(
                    'w-full text-center text-[10px] font-semibold',
                    isActive ? 'text-[#07110a]' : 'text-[#8b9490]'
                  )}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}
