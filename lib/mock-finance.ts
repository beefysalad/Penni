export const accountFilters = ['All', 'Debit', 'Credit'] as const;

export const accountCards = [
  {
    name: 'BPI Savings',
    type: 'High-yield savings',
    balance: '₱22,450',
    accentClassName: 'bg-[#121a16] border border-[#1b2a21]',
    iconClassName: 'bg-[#1a2c1f]',
  },
  {
    name: 'GCash',
    type: 'Daily wallet',
    balance: '₱6,420',
    accentClassName: 'bg-[#12191d] border border-[#1b252b]',
    iconClassName: 'bg-[#1a262d]',
  },
  {
    name: 'Cash',
    type: 'Pocket money',
    balance: '₱1,850',
    accentClassName: 'bg-[#111816] border border-[#1a2620]',
    iconClassName: 'bg-[#173223]',
  },
  {
    name: 'BDO Visa',
    type: 'Credit card',
    balance: '₱33,700',
    accentClassName: 'bg-[#171320] border border-[#241e2d]',
    iconClassName: 'bg-[#231b33]',
  },
] as const;

export const upcomingTransactions = [
  {
    title: 'Bedspace rental',
    date: 'Mar 25',
    amount: '+₱4,500',
    toneClassName: 'bg-[#121a16]',
    iconClassName: 'bg-[#173223]',
    amountClassName: 'text-[#8bff62]',
  },
  {
    title: 'Globe postpaid',
    date: '3 days left',
    amount: '₱999',
    toneClassName: 'bg-[#1d1416]',
    iconClassName: 'bg-[#311e23]',
    amountClassName: 'text-[#ff8a94]',
  },
  {
    title: 'Internet bill',
    date: 'Mar 28',
    amount: '₱1,699',
    toneClassName: 'bg-[#111720]',
    iconClassName: 'bg-[#1a2230]',
    amountClassName: 'text-[#f4f7f5]',
  },
] as const;

export const budgets = [
  {
    name: 'Food',
    used: '₱2,765',
    total: '₱7,000',
    left: '₱4,235 left this month',
    trackClassName: 'bg-[#1a241d]',
    fillClassName: 'w-2/5 bg-[#8bff62]',
  },
  {
    name: 'Shopping',
    used: '₱1,299',
    total: '₱3,000',
    left: '₱1,701 left this month',
    trackClassName: 'bg-[#21181b]',
    fillClassName: 'w-1/2 bg-[#ff8a94]',
  },
  {
    name: 'Transport',
    used: '₱680',
    total: '₱2,400',
    left: '₱1,720 left this month',
    trackClassName: 'bg-[#151f1d]',
    fillClassName: 'w-1/4 bg-[#41d6b2]',
  },
] as const;

export const weeklyBars = [
  'h-9 bg-[#223126]',
  'h-16 bg-[#8bff62]',
  'h-12 bg-[#52d776]',
  'h-6 bg-[#223126]',
  'h-10 bg-[#41d6b2]',
  'h-14 bg-[#8bff62]',
  'h-8 bg-[#223126]',
] as const;

export const statCards = [
  {
    label: 'Spent',
    value: '₱6,653',
    iconWrapClassName: 'bg-[#1d1416]',
    valueClassName: 'text-[#f4f7f5]',
  },
  {
    label: 'Income',
    value: '₱23,500',
    iconWrapClassName: 'bg-[#121a16]',
    valueClassName: 'text-[#f4f7f5]',
  },
  {
    label: 'Net flow',
    value: '₱16,847',
    iconWrapClassName: 'bg-[#111720]',
    valueClassName: 'text-[#f4f7f5]',
  },
  {
    label: 'Transactions',
    value: '18',
    iconWrapClassName: 'bg-[#171320]',
    valueClassName: 'text-[#f4f7f5]',
  },
] as const;

export const categoryStats = [
  {
    name: 'Food',
    amount: '₱2,765',
    percent: '42%',
    dotClassName: 'bg-[#8bff62]',
    trackClassName: 'bg-[#1a241d]',
    fillClassName: 'w-[42%] bg-[#8bff62]',
  },
  {
    name: 'Bills',
    amount: '₱2,160',
    percent: '31%',
    dotClassName: 'bg-[#41d6b2]',
    trackClassName: 'bg-[#151f1d]',
    fillClassName: 'w-[31%] bg-[#41d6b2]',
  },
  {
    name: 'Shopping',
    amount: '₱1,299',
    percent: '19%',
    dotClassName: 'bg-[#d8ff5b]',
    trackClassName: 'bg-[#2a3118]',
    fillClassName: 'w-[19%] bg-[#d8ff5b]',
  },
  {
    name: 'Transport',
    amount: '₱429',
    percent: '8%',
    dotClassName: 'bg-[#ff8a94]',
    trackClassName: 'bg-[#21181b]',
    fillClassName: 'w-[8%] bg-[#ff8a94]',
  },
] as const;

export const quickCategories = [
  { label: 'Groceries', className: 'bg-[#162117] text-[#8bff62]' },
  { label: 'Rent', className: 'bg-[#21181b] text-[#ff8a94]' },
  { label: 'Transport', className: 'bg-[#141f1d] text-[#41d6b2]' },
  { label: 'Coffee', className: 'bg-[#202018] text-[#d8ff5b]' },
] as const;

export const accountOptions = ['BPI Savings', 'GCash', 'Cash', 'BDO Visa'] as const;
