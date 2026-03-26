import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUser } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

export default function PersonalDetailsScreen() {
  const { user } = useUser();

  const userName = user?.fullName || 'Penni User';
  const email = user?.primaryEmailAddress?.emailAddress || 'No email';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join('');

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-safe pt-4">
        <Button
          variant="ghost"
          className="h-11 self-start rounded-full bg-[#111916] px-4"
          onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-[#f4f7f5]">Back</Text>
        </Button>

        <View className="mt-6 rounded-[32px] border border-[#1b2a21] bg-[#0d1411] p-6">
          <Avatar alt={`${userName}'s avatar`} className="size-20 border-2 border-[#8bff62]/25">
            <AvatarImage source={user?.imageUrl ? { uri: user.imageUrl } : undefined} />
            <AvatarFallback className="bg-[#131d17]">
              <Text className="text-xl font-semibold text-[#8bff62]">{initials}</Text>
            </AvatarFallback>
          </Avatar>
          <Text className="mt-5 text-[30px] font-semibold text-white">{userName}</Text>
          <Text className="mt-2 text-[15px] leading-6 text-[#95a39c]">
            Your identity details currently come from Clerk.
          </Text>
        </View>

        <View className="mt-6 gap-4">
          <DetailRow label="Full name" value={userName} />
          <DetailRow label="Email" value={email} />
          <DetailRow label="First name" value={user?.firstName || 'Not set'} />
          <DetailRow label="Last name" value={user?.lastName || 'Not set'} />
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-[24px] border border-[#17211c] bg-[#0f1512] p-5">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#6d786f]">
        {label}
      </Text>
      <Text className="mt-3 text-base font-semibold text-[#f4f7f5]">{value}</Text>
    </View>
  );
}
