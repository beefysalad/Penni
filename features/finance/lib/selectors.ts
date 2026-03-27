import type { Account, Budget, Category, Transaction } from '@/features/finance/lib/finance.types';
import { formatGroupDate } from '@/features/finance/lib/formatters';

export type TransactionSection = {
  title: string;
  count: number;
  data: Transaction[];
};

export function getAccountNetContribution(account: Account) {
  const balance = Number(account.balance);
  return account.type === 'CREDIT_CARD' ? -Math.abs(balance) : balance;
}

export function getNetWorth(accounts: Account[]) {
  return accounts.reduce((sum, account) => sum + getAccountNetContribution(account), 0);
}

export function getPrimaryAssetAccount(accounts: Account[]) {
  return [...accounts]
    .filter((account) => account.type !== 'CREDIT_CARD')
    .sort((a, b) => Number(b.balance) - Number(a.balance))[0] ?? null;
}

export function getTypeBreakdown(accounts: Account[]) {
  const map = new Map<Account['type'], number>();

  for (const account of accounts) {
    map.set(account.type, (map.get(account.type) ?? 0) + getAccountNetContribution(account));
  }

  return Array.from(map.entries())
    .filter(([, balance]) => balance !== 0)
    .sort(([, a], [, b]) => b - a);
}

export function groupTransactionsIntoSections(transactions: Transaction[]): TransactionSection[] {
  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const date = new Date(transaction.transactionAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)?.push(transaction);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, rows]) => ({
      title: formatGroupDate(rows[0]!.transactionAt),
      count: rows.length,
      data: rows,
    }));
}

export function getSpentForBudget(
  budget: Budget,
  transactions: Pick<Transaction, 'amount' | 'categoryId' | 'transactionAt' | 'type'>[],
) {
  const start = new Date(budget.periodStart);
  const end = new Date(budget.periodEnd);

  return transactions
    .filter((transaction) => {
      if (transaction.type !== 'EXPENSE') return false;
      if (budget.categoryId && transaction.categoryId !== budget.categoryId) return false;
      const date = new Date(transaction.transactionAt);
      return date >= start && date <= end;
    })
    .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount)), 0);
}

export function getCurrentMonthBounds() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

export function buildMonthlyExpenseDistribution(
  transactions: Transaction[],
  expenseCategories: Category[],
) {
  const { year, month } = getCurrentMonthBounds();
  const monthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.transactionAt);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === 'EXPENSE');
  const incomeTransactions = monthTransactions.filter((transaction) => transaction.type === 'INCOME');

  const monthExpenses = expenseTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const monthIncome = incomeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const categoryMap = new Map(expenseCategories.map((category) => [category.id, category]));
  const grouped = new Map<
    string,
    {
      id: string;
      name: string;
      colorHex: string | null;
      amount: number;
    }
  >();

  for (const transaction of expenseTransactions) {
    const categoryId = transaction.categoryId ?? 'uncategorized';
    const category = transaction.categoryId ? categoryMap.get(transaction.categoryId) : null;
    const current = grouped.get(categoryId);

    grouped.set(categoryId, {
      id: categoryId,
      name: category?.name ?? 'Uncategorized',
      colorHex: category?.colorHex ?? '#7f8c86',
      amount: (current?.amount ?? 0) + Number(transaction.amount),
    });
  }

  const distributionRows = Array.from(grouped.values())
    .sort((a, b) => b.amount - a.amount)
    .map((row) => ({
      ...row,
      share: monthExpenses > 0 ? Math.round((row.amount / monthExpenses) * 100) : 0,
    }));

  const topCategory = distributionRows[0];

  return {
    monthExpenses,
    monthIncome,
    distributionRows,
    topCategoryName: topCategory?.name ?? 'No category yet',
    topCategoryAmount: topCategory?.amount ?? 0,
    topCategoryShare: topCategory?.share ?? 0,
  };
}
