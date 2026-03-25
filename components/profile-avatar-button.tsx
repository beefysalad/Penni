import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

type ProfileAvatarButtonProps = {
  className?: string;
};

export function ProfileAvatarButton({ className }: ProfileAvatarButtonProps) {
  const { user } = useUser();

  const { initials, imageSource, userName } = React.useMemo(() => {
    const userName = user?.fullName || user?.emailAddresses[0]?.emailAddress || 'Penni User';
    const initials = userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0]?.toUpperCase())
      .join('');

    return {
      initials,
      imageSource: user?.imageUrl ? { uri: user.imageUrl } : undefined,
      userName,
    };
  }, [user?.emailAddresses[0]?.emailAddress, user?.fullName, user?.imageUrl]);

  return (
    <Pressable
      className={className ?? 'rounded-full'}
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel="Open profile and settings">
      <Avatar alt={`${userName}'s avatar`} className="size-11 border-2 border-[#8bff62]/25">
        <AvatarImage source={imageSource} />
        <AvatarFallback className="bg-[#131d17]">
          <Text className="text-sm font-semibold text-[#8bff62]">{initials}</Text>
        </AvatarFallback>
      </Avatar>
    </Pressable>
  );
}
