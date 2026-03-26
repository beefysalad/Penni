import { Button, type ButtonProps } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { View, type StyleProp, type TextStyle, type ViewProps } from 'react-native';

const pillVariants = cva('rounded-full border', {
  variants: {
    variant: {
      default: 'border-[#17211c] bg-[#131b17]',
      subtle: 'border-transparent bg-[#131b17]',
      selected: 'border-[#8bff62] bg-[#1f3526]',
      success: 'border-transparent bg-[#8bff62]',
    },
    size: {
      sm: 'px-2.5 py-1',
      md: 'px-3.5 py-1.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
});

const pillTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-[#dce2de]',
      subtle: 'text-[#dce2de]',
      selected: 'text-[#8bff62]',
      success: 'text-[#07110a]',
    },
    size: {
      sm: 'text-[11px]',
      md: 'text-[12px]',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
});

type PillStyleProps = VariantProps<typeof pillVariants>;

type PillProps = Omit<ButtonProps, 'children' | 'variant' | 'size'> &
  PillStyleProps & {
    label: string;
    textClassName?: string;
    textStyle?: StyleProp<TextStyle>;
  };

export function Pill({
  label,
  variant,
  size,
  className,
  textClassName,
  textStyle,
  ...props
}: PillProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('h-auto rounded-full px-0 py-0', pillVariants({ variant, size }), className)}
      {...props}>
      <Text className={cn(pillTextVariants({ variant, size }), textClassName)} style={textStyle}>
        {label}
      </Text>
    </Button>
  );
}

type BadgeProps = Omit<ViewProps, 'children'> &
  PillStyleProps & {
    label: string;
    textClassName?: string;
    textStyle?: StyleProp<TextStyle>;
  };

export function Badge({
  label,
  variant = 'success',
  size = 'sm',
  className,
  textClassName,
  textStyle,
  ...props
}: BadgeProps) {
  return (
    <View className={cn(pillVariants({ variant, size }), className)} {...props}>
      <Text className={cn(pillTextVariants({ variant, size }), textClassName)} style={textStyle}>
        {label}
      </Text>
    </View>
  );
}
