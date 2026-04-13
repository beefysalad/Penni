import { ProfileAvatarButton } from '@/components/navigation/profile-avatar-button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type AppPageHeaderProps = {
  eyebrow?: string;
  title: string;
  meta?: string;
  subtitle?: string;
  inverted?: boolean;
};

export function AppPageHeader({
  eyebrow,
  title,
  meta,
  subtitle,
  inverted = false,
}: AppPageHeaderProps) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? (
          <Text
            className={cn(
              'text-xs font-semibold uppercase tracking-[2.4px]',
              inverted ? 'text-[#8bff62]/70' : 'text-[#7b8499]'
            )}>
            {eyebrow}
          </Text>
        ) : null}
        <Text
          className={cn(
            'mt-2 text-[30px] font-semibold leading-[36px]',
            inverted ? 'text-white' : 'text-[#172033]'
          )}>
          {title}
        </Text>
        {meta ? (
          <Text
            className={cn(
              'mt-2 text-[13px]',
              inverted ? 'text-[#b6c2bb]' : 'text-[#6f7890]'
            )}>
            {meta}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            className={cn(
              'mt-2 text-[15px] leading-6',
              inverted ? 'text-[#9ca8a1]' : 'text-[#7b8499]'
            )}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ProfileAvatarButton className="mt-1" />
    </View>
  );
}
