import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  BellIcon,
  ChevronRightIcon,
  CreditCardIcon,
  LogOutIcon,
  Settings2Icon,
  UserRoundIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

const SETTINGS_ITEMS = [
  { label: 'Personal details', icon: UserRoundIcon },
  { label: 'Notifications', icon: BellIcon },
  { label: 'Connected accounts', icon: CreditCardIcon },
  { label: 'Preferences', icon: Settings2Icon },
] as const;

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const userName = user?.fullName || 'Penni User';
  const email = user?.emailAddresses[0]?.emailAddress || 'No email';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join('');

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-10 pt-safe pt-4">
        <View className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            className="size-12 rounded-full bg-[#111916]"
            onPress={() => router.back()}>
            <Text className="text-base font-semibold text-[#f4f7f5]">Back</Text>
          </Button>
          <Text className="text-lg font-semibold text-[#f4f7f5]">Settings</Text>
          <View className="size-12" />
        </View>

        <View className="mt-6 rounded-[32px] border border-[#1b2a21] bg-[#0d1411] p-6">
          <Avatar alt={`${userName}'s avatar`} className="size-20 border-2 border-[#8bff62]/25">
            <AvatarImage source={user?.imageUrl ? { uri: user.imageUrl } : undefined} />
            <AvatarFallback className="bg-[#131d17]">
              <Text className="text-xl font-semibold text-[#8bff62]">{initials}</Text>
            </AvatarFallback>
          </Avatar>
          <Text className="mt-5 text-[30px] font-semibold text-white">{userName}</Text>
          <Text className="mt-2 text-[15px] leading-6 text-[#95a39c]">{email}</Text>
        </View>

        <View className="mt-6 rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
          <Text className="text-[24px] font-semibold text-[#f4f7f5]">Profile and account</Text>
          <View className="mt-5 gap-3">
            {SETTINGS_ITEMS.map((item) => (
              <Pressable
                key={item.label}
                className="flex-row items-center gap-4 rounded-[24px] bg-[#131b17] px-4 py-4">
                <View className="size-12 items-center justify-center rounded-full bg-[#1a2c1f]">
                  <Icon as={item.icon} className="size-5 text-[#8bff62]" />
                </View>
                <Text className="flex-1 text-base font-semibold text-[#f4f7f5]">{item.label}</Text>
                <Icon as={ChevronRightIcon} className="size-5 text-[#6d786f]" />
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          variant="ghost"
          className="mt-6 h-14 rounded-[24px] bg-[#1d1416]"
          onPress={() => signOut()}>
          <Icon as={LogOutIcon} className="mr-2 size-5 text-[#ff8a94]" />
          <Text className="text-base font-semibold text-[#ff8a94]">Log out</Text>
        </Button>
      </ScrollView>
    </View>
  );
}
