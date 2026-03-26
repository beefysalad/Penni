import { cn } from '@/lib/utils';
import { SearchIcon } from 'lucide-react-native';
import { TextInput, View, type TextInputProps } from 'react-native';

type SearchInputProps = Omit<TextInputProps, 'style'> & {
  /** Override the search icon color (default: #8b9490) */
  iconColor?: string;
  /** Additional classes for the outer wrapper */
  className?: string;
};

/**
 * Reusable search input with icon.
 *
 * Applies the platform-specific vertical-centering fix
 * (`paddingVertical: 0`, `textAlignVertical: 'center'`,
 * `includeFontPadding: false`) so the placeholder text
 * always sits on the same baseline as the icon.
 */
export function SearchInput({
  iconColor = '#8b9490',
  placeholder = 'Search',
  placeholderTextColor = '#6d786f',
  className,
  ...props
}: SearchInputProps) {
  return (
    <View className={cn('flex-row items-center gap-3 rounded-[18px] bg-[#131b17] px-4', className)}>
      <SearchIcon color={iconColor} size={16} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        className="h-12 flex-1 bg-transparent px-0 text-[16px] text-[#f4f7f5]"
        style={{
          lineHeight: 20,
          paddingVertical: 0,
          textAlignVertical: 'center',
          includeFontPadding: false,
        }}
        {...props}
      />
    </View>
  );
}
