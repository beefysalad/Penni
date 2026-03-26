import { Text } from '@/components/ui/text';
import { ReactNode } from 'react';
import { View } from 'react-native';

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <View className="gap-3">
      <Text className="text-[12px] font-semibold uppercase tracking-[2.4px] text-[#6f7d74]">
        {label}
      </Text>
      {children}
    </View>
  );
}
