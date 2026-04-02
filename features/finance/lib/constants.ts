import type { AccountType } from '@/features/finance/lib/finance.types';
import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  SmartphoneIcon,
  Wallet2Icon,
} from 'lucide-react-native';

export const ACCOUNT_TYPE_META: Record<
  AccountType,
  {
    label: string;
    icon: typeof CreditCardIcon;
    iconWrapClassName: string;
    accentTextClassName: string;
    accentColor?: string;
  }
> = {
  CASH: {
    label: 'Cash',
    icon: BanknoteIcon,
    iconWrapClassName: 'bg-[#1a2c1f]',
    accentTextClassName: 'text-[#41d6b2]',
    accentColor: '#41d6b2',
  },
  BANK_ACCOUNT: {
    label: 'Debit',
    icon: LandmarkIcon,
    iconWrapClassName: 'bg-[#1a2c1f]',
    accentTextClassName: 'text-[#8bff62]',
    accentColor: '#8bff62',
  },
  E_WALLET: {
    label: 'E-wallet',
    icon: SmartphoneIcon,
    iconWrapClassName: 'bg-[#16212d]',
    accentTextClassName: 'text-[#5aa9ff]',
    accentColor: '#5aa9ff',
  },
  CREDIT_CARD: {
    label: 'Credit',
    icon: CreditCardIcon,
    iconWrapClassName: 'bg-[#211b2f]',
    accentTextClassName: 'text-[#ffc857]',
    accentColor: '#ffc857',
  },
  OTHER: {
    label: 'Other',
    icon: Wallet2Icon,
    iconWrapClassName: 'bg-[#1b1b1b]',
    accentTextClassName: 'text-[#d8ff5b]',
    accentColor: '#d8ff5b',
  },
};

export const ACCOUNT_FILTERS = ['All', 'Debit', 'Credit', 'Cash', 'E-wallet', 'Other'] as const;
export type AccountFilter = (typeof ACCOUNT_FILTERS)[number];

export const TYPE_FILTERS = ['All', 'Expenses', 'Income'] as const;
export type TypeFilter = (typeof TYPE_FILTERS)[number];

export const TRANSACTION_MODES = ['Expense', 'Income'] as const;

export const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank account', value: 'BANK_ACCOUNT' },
  { label: 'E-wallet', value: 'E_WALLET' },
  { label: 'Credit card', value: 'CREDIT_CARD' },
  { label: 'Other', value: 'OTHER' },
] as const;

export const ACCOUNT_CURRENCY_OPTIONS = ['PHP', 'USD', 'SGD'] as const;

export const CATEGORY_TYPES = [
  { label: 'Expense', value: 'EXPENSE' },
  { label: 'Income', value: 'INCOME' },
] as const;

export const CATEGORY_COLORS = ['#8BFF62', '#5AA9FF', '#41D6B2', '#FFC857', '#FF8A94'] as const;
