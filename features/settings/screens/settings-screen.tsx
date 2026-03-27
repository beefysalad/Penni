import { AppPageHeader } from '@/components/navigation/app-page-header';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { ACCOUNT_ITEMS, APP_ITEMS, FINANCE_ITEMS } from '@/features/settings/lib/constants';
import { formatMemberSince } from '@/features/settings/lib/formatters';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  LogOutIcon,
  PenLineIcon,
  ShieldCheckIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

// ─── Main screen ──────────────────────────────────────────────────────────────

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
  const memberSince = formatMemberSince(user?.createdAt?.toString());

  return (
    <View className="flex-1 bg-[#060b08]">
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerClassName="pb-44" showsVerticalScrollIndicator={false}>
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <View className="rounded-b-[36px] bg-[#0b120e] px-6 pb-8 pt-safe pt-4">
          <AppPageHeader
            eyebrow="Your account"
            title="Profile"
            subtitle="Review your details, connected sources, and the preferences that shape Penni."
            inverted
          />
        </View>

        <View className="gap-5 px-6 pt-6">
          {/* ─── Profile card ──────────────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
            <View className="flex-row items-center gap-4">
              <Avatar alt={`${userName}'s avatar`} className="size-[72px] border-2 border-[#8bff62]/25">
                <AvatarImage source={user?.imageUrl ? { uri: user.imageUrl } : undefined} />
                <AvatarFallback className="bg-[#131d17]">
                  <Text className="text-xl font-semibold text-[#8bff62]">{initials}</Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-[24px] font-semibold text-white" numberOfLines={1}>
                  {userName}
                </Text>
                <Text className="mt-1 text-[14px] text-[#7f8c86]" numberOfLines={1}>
                  {email}
                </Text>
              </View>
            </View>

            {/* Member since + badges */}
            <View className="mt-4 flex-row items-center gap-2">
              {memberSince ? (
                <View className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3 py-1.5">
                  <ShieldCheckIcon color="#8bff62" size={12} />
                  <Text className="text-[11px] font-semibold text-[#93a19a]">
                    Member since {memberSince}
                  </Text>
                </View>
              ) : null}
              <Pressable
                className="flex-row items-center gap-1.5 rounded-full bg-[#18221d] px-3 py-1.5"
                onPress={() => router.push('/personal-details')}>
                <PenLineIcon color="#8bff62" size={12} />
                <Text className="text-[11px] font-semibold text-[#8bff62]">Edit profile</Text>
              </Pressable>
            </View>
          </View>

          {/* ─── Account settings ──────────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              Account
            </Text>
            <View className="mt-4 gap-2">
              {ACCOUNT_ITEMS.map((item) => (
                <SettingsRow key={item.label} item={item} />
              ))}
            </View>
          </View>

          {/* ─── Finance settings ──────────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              Finance
            </Text>
            <View className="mt-4 gap-2">
              {FINANCE_ITEMS.map((item) => (
                <SettingsRow key={item.label} item={item} />
              ))}
            </View>
          </View>

          {/* ─── App settings ──────────────────────────────────────────────── */}
          <View className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#6d786f]">
              App
            </Text>
            <View className="mt-4 gap-2">
              {APP_ITEMS.map((item) => (
                <SettingsRow key={item.label} item={item} />
              ))}
            </View>
          </View>

          {/* ─── Log out ───────────────────────────────────────────────────── */}
          <Pressable
            className="flex-row items-center justify-center gap-2 rounded-[24px] bg-[#1d1416] px-5 py-4"
            onPress={() => signOut()}>
            <LogOutIcon color="#ff8a94" size={18} />
            <Text className="text-base font-semibold text-[#ff8a94]">Log out</Text>
          </Pressable>

          {/* ─── Footer ────────────────────────────────────────────────────── */}
          <View className="items-center py-4">
            <Text className="text-xs text-[#4a5650]">Penni v1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <AppTabBar currentTab="profile" />
    </View>
  );
}
