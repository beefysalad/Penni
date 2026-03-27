import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import { SparklesIcon } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export function ExpenseDonut({
  rows,
  total,
}: {
  rows: Array<{ colorHex: string | null; amount: number }>;
  total: number;
}) {
  const size = 184;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#17211c" strokeWidth={strokeWidth} fill="none" />
        {rows.map((row, index) => {
          const dash = total > 0 ? (row.amount / total) * circumference : 0;
          const circle = (
            <Circle
              key={`${row.colorHex ?? '#7f8c86'}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={row.colorHex ?? '#7f8c86'}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
          offset += dash;
          return circle;
        })}
      </Svg>
      <View className="absolute items-center">
        <Text className="text-[32px] font-semibold tracking-[-1px] text-[#f4f7f5]">
          {rows[0]?.amount && total > 0 ? `${Math.round((rows[0].amount / total) * 100)}%` : '0%'}
        </Text>
        <Text className="mt-1 text-sm text-[#7f8c86]">{rows[0]?.amount ? 'Top share' : 'No spend'}</Text>
      </View>
    </View>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
  color,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <View className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
      <View className="size-11 items-center justify-center rounded-full bg-[#131b17]">
        <Icon as={icon} className="size-5" color={color} />
      </View>
      <Text className="mt-4 text-xs font-medium uppercase tracking-[1.8px] text-[#6d786f]">{label}</Text>
      <Text className="mt-3 text-[17px] font-semibold leading-6 text-[#f4f7f5]">{value}</Text>
      <Text className="mt-1 text-sm leading-5 text-[#7f8c86]">{hint}</Text>
    </View>
  );
}

export function SmartInsightsCard({
  appleAISupported,
  appleAIAvailabilityMessage,
  isGeneratingSummary,
  aiSummary,
  aiSummaryError,
}: {
  appleAISupported: boolean;
  appleAIAvailabilityMessage: string;
  isGeneratingSummary: boolean;
  aiSummary: string | null;
  aiSummaryError: string | null;
}) {
  return (
    <View className="rounded-[30px] border border-[#203326] bg-[#0d1511] p-6 shadow-xl shadow-[#8bff62]/5">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="size-10 items-center justify-center rounded-[14px] border border-[#203326] bg-[#16231b]">
            <Icon as={SparklesIcon} className="size-4 text-[#8bff62]" />
          </View>
          <Text className="text-[20px] font-semibold tracking-[-0.5px] text-[#f4f7f5]">Penni AI</Text>
        </View>
        {appleAISupported ? (
          <View className="flex-row items-center gap-1.5 rounded-full border border-[#1a2c1f] bg-[#111c16] px-2.5 py-1">
            <View className="size-1.5 rounded-full bg-[#8bff62] opacity-80" />
            <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#8bff62]">Active</Text>
          </View>
        ) : null}
      </View>

      <Text className="mb-5 text-[14px] leading-5 text-[#95a39c]">
        {appleAISupported
          ? 'Your personalized financial summary powered by on-device Apple Intelligence.'
          : 'Apple Intelligence is optional. Penni will still work normally without it.'}
      </Text>

      <View className="rounded-[24px] border border-[#17241b] bg-[#111916] p-5 shadow-sm shadow-black/20">
        {aiSummary ? (
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#8bff62]">Latest read</Text>
            <Text className="mt-3 text-[15px] leading-7 text-[#eef3ef]">{aiSummary}</Text>
          </View>
        ) : isGeneratingSummary ? (
          <View className="flex-row items-start gap-3">
            <View className="mt-1.5 size-2 rounded-full bg-[#ffc857]" />
            <View className="flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#ffc857]">Thinking</Text>
              <Text className="mt-2 text-[15px] leading-7 text-[#95a39c]">Penni is reading the latest movement on this device...</Text>
            </View>
          </View>
        ) : aiSummaryError ? (
          <View className="flex-row items-start gap-3">
            <View className="mt-1.5 size-2 rounded-full bg-[#ff8a94]" />
            <View className="flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#ff8a94]">Unavailable</Text>
              <Text className="mt-2 text-[14px] leading-6 text-[#ff8a94]">{aiSummaryError}</Text>
            </View>
          </View>
        ) : (
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#6d786f]">Status</Text>
            <Text className="mt-3 text-[14px] leading-6 text-[#95a39c]">
              {appleAISupported ? 'Your latest insight will appear here automatically.' : appleAIAvailabilityMessage}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
