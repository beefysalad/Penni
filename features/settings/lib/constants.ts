import {
  BotIcon,
  CreditCardIcon,
  GoalIcon,
  MessageSquareIcon,
  Settings2Icon,
  ShapesIcon,
  UserRoundIcon,
} from 'lucide-react-native';

export const ACCOUNT_ITEMS = [
  {
    label: 'Personal details',
    description: 'Name, email, and identity',
    icon: UserRoundIcon,
    iconBg: 'bg-[#1a2c1f]',
    iconColor: '#8bff62',
    href: '/personal-details' as const,
  },
  {
    label: 'Connected accounts',
    description: 'Linked banks and wallets',
    icon: CreditCardIcon,
    iconBg: 'bg-[#1a262d]',
    iconColor: '#5aa9ff',
    href: '/connected-accounts' as const,
  },
] as const;

export const FINANCE_ITEMS = [
  {
    label: 'Recurring items',
    description: 'Upcoming scheduled bills and income',
    icon: ShapesIcon, // Just reusing shapes or getting another icon
    iconBg: 'bg-[#1e2a22]',
    iconColor: '#8bff62',
    href: '/recurring' as const,
  },
  {
    label: 'Categories',
    description: 'Organize spending and income',
    icon: ShapesIcon,
    iconBg: 'bg-[#231b33]',
    iconColor: '#c89dff',
    href: '/categories' as const,
  },
  {
    label: 'Budgets',
    description: 'Set monthly limits by category',
    icon: GoalIcon,
    iconBg: 'bg-[#2a2518]',
    iconColor: '#ffc857',
    href: '/budgets' as const,
  },
] as const;

export const APP_ITEMS = [
  {
    label: 'AI Chat',
    description: 'Natural-language command assistant',
    icon: BotIcon,
    iconBg: 'bg-[#16231b]',
    iconColor: '#8bff62',
    href: '/ai-chat' as const,
  },
  {
    label: 'Preferences',
    description: 'Currency, appearance, and defaults',
    icon: Settings2Icon,
    iconBg: 'bg-[#18221d]',
    iconColor: '#41d6b2',
    href: '/preferences' as const,
  },
  {
    label: 'Send feedback',
    description: 'Report a bug or suggest a feature',
    icon: MessageSquareIcon,
    iconBg: 'bg-[#1e1c2e]',
    iconColor: '#a084ff',
    href: '/feedback' as const,
  },
] as const;

export const CURRENCY_OPTIONS = ['PHP', 'USD', 'SGD'] as const;
export const START_OF_WEEK_OPTIONS = ['Monday', 'Sunday'] as const;
export const SUMMARY_DAY_OPTIONS = ['Monday', 'Friday', 'Sunday'] as const;
export const ALERT_SENSITIVITY_OPTIONS = ['Calm', 'Balanced', 'Strict'] as const;

export const CONNECTIONS = [
  {
    title: 'Bank accounts',
    description: 'Link checking and savings accounts once you are ready for live balance sync.',
    iconName: 'landmark' as const,
  },
  {
    title: 'Cards and wallets',
    description: 'Keep credit cards and digital wallets in one place for a fuller money picture.',
    iconName: 'credit-card' as const,
  },
  {
    title: 'Secure connection flow',
    description: 'When this is wired up for real, connections should happen through a secure provider.',
    iconName: 'shield-check' as const,
  },
] as const;
