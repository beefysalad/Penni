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
    progress: 0.4,
    trackColor: '#1a241d',
    fillColor: '#8bff62',
  },
  {
    name: 'Shopping',
    used: '₱1,299',
    total: '₱3,000',
    left: '₱1,701 left this month',
    progress: 0.43,
    trackColor: '#21181b',
    fillColor: '#ff8a94',
  },
  {
    name: 'Transport',
    used: '₱680',
    total: '₱2,400',
    left: '₱1,720 left this month',
    progress: 0.28,
    trackColor: '#151f1d',
    fillColor: '#41d6b2',
  },
] as const;

export const weeklyBars = [
  { height: 36, color: '#4fdc97' },
  { height: 64, color: '#8bff62' },
  { height: 48, color: '#41d6b2' },
  { height: 24, color: '#ffc857' },
  { height: 40, color: '#5aa9ff' },
  { height: 56, color: '#ff8a94' },
  { height: 32, color: '#d8ff5b' },
] as const;

export const statCards = [
  {
    label: 'Spent',
    value: '₱6,653',
    iconWrapClassName: 'bg-[#1d1416]',
    iconColor: '#ff8a94',
    valueClassName: 'text-[#f4f7f5]',
  },
  {
    label: 'Income',
    value: '₱23,500',
    iconWrapClassName: 'bg-[#121a16]',
    iconColor: '#8bff62',
    valueClassName: 'text-[#f4f7f5]',
  },
  {
    label: 'Net flow',
    value: '₱16,847',
    iconWrapClassName: 'bg-[#111720]',
    iconColor: '#5aa9ff',
    valueClassName: 'text-[#f4f7f5]',
  },
  {
    label: 'Transactions',
    value: '18',
    iconWrapClassName: 'bg-[#171320]',
    iconColor: '#ffc857',
    valueClassName: 'text-[#f4f7f5]',
  },
] as const;

export const categoryStats = [
  {
    name: 'Food',
    amount: '₱2,765',
    percent: '42%',
    dotColor: '#8bff62',
  },
  {
    name: 'Bills',
    amount: '₱2,160',
    percent: '31%',
    dotColor: '#5aa9ff',
  },
  {
    name: 'Shopping',
    amount: '₱1,299',
    percent: '19%',
    dotColor: '#ffc857',
  },
  {
    name: 'Transport',
    amount: '₱429',
    percent: '8%',
    dotColor: '#ff8a94',
  },
] as const;

export const quickCategories = [
  {
    label: 'Groceries',
    wrapClassName: 'bg-[#162117]',
    textClassName: 'text-[#8bff62]',
  },
  {
    label: 'Rent',
    wrapClassName: 'bg-[#21181b]',
    textClassName: 'text-[#ff8a94]',
  },
  {
    label: 'Transport',
    wrapClassName: 'bg-[#141f1d]',
    textClassName: 'text-[#41d6b2]',
  },
  {
    label: 'Bills',
    wrapClassName: 'bg-[#202018]',
    textClassName: 'text-[#d8ff5b]',
  },
] as const;

export const accountOptions = ['BPI Savings', 'GCash', 'Cash', 'BDO Visa'] as const;

export const transactionFeed = [
  {
    title: 'McDo lunch',
    account: 'GCash',
    category: 'Food',
    amount: '-₱245',
    time: 'Today, 12:40 PM',
    toneClassName: 'bg-[#121a16]',
    iconClassName: 'bg-[#173223]',
    amountClassName: 'text-[#ff8a94]',
  },
  {
    title: 'Salary payout',
    account: 'BPI Savings',
    category: 'Income',
    amount: '+₱4,500',
    time: 'Today, 8:00 AM',
    toneClassName: 'bg-[#111720]',
    iconClassName: 'bg-[#1a2230]',
    amountClassName: 'text-[#8bff62]',
  },
  {
    title: 'Globe postpaid',
    account: 'BDO Visa',
    category: 'Bills',
    amount: '-₱999',
    time: 'Yesterday',
    toneClassName: 'bg-[#1d1416]',
    iconClassName: 'bg-[#311e23]',
    amountClassName: 'text-[#ff8a94]',
  },
  {
    title: 'Grab ride',
    account: 'GCash',
    category: 'Transport',
    amount: '-₱186',
    time: 'Yesterday',
    toneClassName: 'bg-[#141f1d]',
    iconClassName: 'bg-[#183128]',
    amountClassName: 'text-[#f4f7f5]',
  },
] as const;
